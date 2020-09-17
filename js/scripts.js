
//menu
$( document ).ready(function(){
	 $(".button-collapse").sideNav();
});
//modal
  $('.modal').modal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      inDuration: 300, // Transition in duration
      outDuration: 200, // Transition out duration
      startingTop: '4%', // Starting top style attribute
      endingTop: '10%', // Ending top style attribute
      ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.

        console.log(modal, trigger);
      },
      complete: function() {  } // Callback for Modal close
    }
  );
//Tag input
	$('.chips').material_chip();
	$('.chips-initial').material_chip({
	data: [{ // autocomplete data
      tag: 'Apple',
    }, {
      tag: 'Microsoft',
    }, {
      tag: 'Google',
    }],
  });
  $('.chips-placeholder').material_chip({
    placeholder: 'Enter a tag',
    secondaryPlaceholder: '+Tag',
  });
  $('.chips-autocomplete').material_chip({
    autocompleteOptions: {
      data: {
        'Apple': null,
        'Microsoft': null,
        'Google': null
      },
      limit: Infinity,
      minLength: 1
    }
  });





//Setup local storage
if (typeof(Storage) !== "undefined") {
  // localStorage/sessionStorage.
  localStorage.wp_site_url = "http://localhost/km/";
  sessionStorage.wp_site_pw = "iloveduke";
} else {
	console.log('Warning: Local storage is not supported.');
}

//Some vars to define.
const list = document.querySelector('#draftbox');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#content');

const form = document.querySelector('#postform');
const submitBtn = document.querySelector('form button');


//IndexedDB
let db;

window.onload = function() {
  // Open our database; it is created if it doesn't already exist
  // (see onupgradeneeded below)
  let request = window.indexedDB.open('notes_db', 1);

  // onerror handler signifies that the database didn't open successfully
  request.onerror = function() {
    console.log('Database failed to open');
  };

  // onsuccess handler signifies that the database opened successfully
  request.onsuccess = function() {
    console.log('Database opened succesfully');

    // Store the opened database object in the db variable. This is used a lot below
    db = request.result;

    // Run the displayData() function to display the notes already in the IDB
    displayData();
  };

  // Setup the database tables if this has not already been done
  request.onupgradeneeded = function(e) {

    // Grab a reference to the opened database
    let db = e.target.result;

    // Create an objectStore to store our notes in (basically like a single table)
    // including a auto-incrementing key
    let objectStore = db.createObjectStore('notes_os', { keyPath: 'id', autoIncrement:true });

    // Define what data items the objectStore will contain
    objectStore.createIndex('title', 'title', { unique: false });
    objectStore.createIndex('body', 'body', { unique: false });
    objectStore.createIndex('tags', 'tags', { unique: false });

    console.log('Database setup complete');
  };

  // Create an onsubmit handler so that when the form is submitted the addData() function is run
  form.onsubmit = addData;

  // Define the addData() function
  function addData(e) {
    // prevent default - we don't want the form to submit in the conventional way
    e.preventDefault();

	let tagsInput = JSON.parse(JSON. stringify($('#tags').material_chip('data')));
	let tagInputval = Object.values(tagsInput).map(x => x.tag); // TAG will SAVE AS AN Array
    // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
    let newItem = { title: titleInput.value, body: bodyInput.value, tags: tagInputval };

    // open a read/write db transaction, ready for adding the data
    let transaction = db.transaction(['notes_os'], 'readwrite');

    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore('notes_os');

    // Make a request to add our newItem object to the object store
    var request = objectStore.add(newItem);
    request.onsuccess = function() {
      // Clear the form, ready for adding the next entry
      titleInput.value = '';
      bodyInput.value = '';
     tagsInput.length = 0;
    };

    // Report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function() {
      console.log('Transaction completed: database modification finished.');

      // update the display of data to show the newly added item, by running displayData() again.
      displayData();
    };

    transaction.onerror = function() {
      console.log('Transaction not opened due to error');
    };
  }

  // Define the displayData() function
  function displayData() {
    // Here we empty the contents of the list element each time the display is updated
    // If you ddn't do this, you'd get duplicates listed each time a new note is added
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    // Open our object store and then get a cursor - which iterates through all the
    // different data items in the store
    let objectStore = db.transaction('notes_os').objectStore('notes_os');
    objectStore.openCursor().onsuccess = function(e) {
      // Get a reference to the cursor
      let cursor = e.target.result;

      // If there is still another data item to iterate through, keep running this code
      if(cursor) {
        // Create a list item, h3, and p to put each data item inside when displaying it
        // structure the HTML fragment, and append it inside the list
        const listItem = document.createElement('li');
        const h3 = document.createElement('div');
		h3.classList.add("collapsible-header");
        const para = document.createElement('div');
		para.classList.add("collapsible-body");

        listItem.appendChild(h3);
        listItem.appendChild(para);
        list.appendChild(listItem);

        // Put the data from the cursor inside the h3 and para
        h3.textContent = cursor.value.title;
        para.textContent = cursor.value.body;

        // Store the ID of the data item inside an attribute on the listItem, so we know
        // which item it corresponds to. This will be useful later when we want to delete items
        listItem.setAttribute('data-note-id', cursor.value.id);

        // Create a button and place it inside each listItem
        const deleteBtn = document.createElement('button');
        listItem.appendChild(deleteBtn);
        deleteBtn.textContent = 'Del';
        deleteBtn.classList.add("btn-floating","waves-effect","waves-light","draftdelete");

        // Set an event handler so that when the button is clicked, the deleteItem()
        // function is run
        deleteBtn.onclick = deleteItem;
		
		document.querySelector('#daftcount').innerHTML = document.getElementById('draftbox').childNodes.length;
        // Iterate to the next item in the cursor
        cursor.continue();
      } else {
        // Again, if list item is empty, display a 'No notes stored' message
        if(!list.firstChild) {
          const listItem = document.createElement('li');
          listItem.textContent = 'No dafts stored.'
          list.appendChild(listItem);
        }
        // if there are no more cursor items to iterate through, say so
        console.log('Notes all displayed');
      }
    };
  }

  // Define the deleteItem() function
  function deleteItem(e) {
    // retrieve the name of the task we want to delete. We need
    // to convert it to a number before trying it use it with IDB; IDB key
    // values are type-sensitive.
    let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));

    // open a database transaction and delete the task, finding it using the id we retrieved above
    let transaction = db.transaction(['notes_os'], 'readwrite');
    let objectStore = transaction.objectStore('notes_os');
    let request = objectStore.delete(noteId);

    // report that the data item has been deleted
    transaction.oncomplete = function() {
      // delete the parent of the button
      // which is the list item, so it is no longer displayed
      e.target.parentNode.parentNode.removeChild(e.target.parentNode);
      console.log('Note ' + noteId + ' deleted.');

      // Again, if list item is empty, display a 'No notes stored' message
      if(!list.firstChild) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No dafts stored.';
        list.appendChild(listItem);
      }
    };
  }

};

//Site setup
const WP_SITE_URL = localStorage.wp_site_url;
const WP_REST = WP_SITE_URL + 'wp-json/wp/v2/';
const WP_POSTS = WP_REST + 'posts?per_page=15';


//load posts from wp site var Ajax
$( document ).ready(function(){
        $.ajax({
            url : WP_POSTS,
            dataType : "json",
            type : "get",
            async : true,
            success : function(data) {
                $("#wp_posts").html("");
				$("#siteName").html('duke');
				console.log(data);
                $.each(data,function(i,item){

                    $("#wp_posts").append(
							"<li><div class='collapsible-header'><i class='material-icons'>filter_drama</i>"
							+ item.title.rendered +
							"<span class='new badge'>"+ i +"</span></div><div class='collapsible-body'><span>"
							+ item.content.rendered +
							"</span></div></li>"
                    );
					
                });
            }
        })
});

//Get posts
$('#submitDraft').click(function(){
	if(bodyInput.value != ''){
		$('#modal1').modal('close');
		$('#tags div.chip').remove();
		delete $('#tags').material_chip('data');
	}else{
		console.log('ERROR empty content');
	}
})
