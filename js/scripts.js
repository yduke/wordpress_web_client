//Setup local storage
if (typeof(Storage) !== "undefined") {
  // localStorage/sessionStorage.
  localStorage.wp_site_url = "http://localhost/km/";
  sessionStorage.wp_site_pw = "iloveduke";
} else {
	console.log('Warning: Local storage is not supported.');
}

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
                $.each(data,function(i,item){
console.log(item);
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
  
//Get posts
