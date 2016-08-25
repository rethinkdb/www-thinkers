console.log("wat");


const USERS = new Map();

// Look up whether the user has starred the project
function lookupUser(username, element) {

  if (USERS.has(username)) {
    return USERS.get(username);
  } else {
    fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: "token b11c2a18a89fc318350949cfdacb67646c61c1b0",
      },
    })
    .then(function(response) {
      const result = response.status === 200 || response.status === 304;
      console.log("SUCCESS", result);
      USERS.set(username, result);
      $(element).trigger("blur");

    }).catch((err) => {
      console.log("ERROR", err);
      USERS.set(username, false);
      $(element).trigger("blur");
    });

    return true;
  }
}

$(document).ready(function() {
    // Show info popup
    // TODO: consider rewriting this to use jQuery's functions to make things a bit easier
    var acc = document.getElementsByClassName("show-popup");
    var i;
    for (i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("show");
        }
    }

    // $('.some-class').click(function() {
    //     $('.popup', $(this).parent()).toggleClass('active');
    // })
    /* Collect personal details from user:
    - validate and submit form on input
    - TODO: add required fields to `name` */
    $.validator.addMethod("githubUsernameCheck", function (value, element) {
        return lookupUser(value, element);
    }, 'Please provide a valid Github handle.');

    $(".user-info form").validate({
        onkeyup: false,
        rules: {
            name: {
                required: true,
                minlength: 2,
            },
            github: {
                required: true,
                githubUsernameCheck: true,
            },
            email: {
                required: true,
                email: true
            },
            messages: {
                github: {
                    required: "Please enter a Github username",
                    // depends: "Please provide a valid Github username",
                }
            }
        }
    });

    jQuery.validator.addMethod("zipcode", function(value, element) {
        return this.optional(element) || /^\d{5}(?:-\d{4})?$/.test(value);
    }, "Please provide a valid zipcode.");

    // Collect shipping details from user.
    $(".shipping-thinker form").validate({
        rules: {
            address1: {
                required: true
            },
            city: {
                required: true
            },
            zip: {
                required: true,
                zipcode: true
            }
        }
    });
});

/*  TODO: add a click handler for the forms
        Here's what we had before (but we need to specify a handler):
            $(".btn").click();

        $(document).ready(function(){
        $("button").click(function(){
            alert("foo")
            $(".submit").load("file:///Users/Lindsey/Git/www-thinkers/complete.html");
            });
        }); */

/* Practice

 */
