// Look up whether the user has starred the project
function lookupUser() {

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
    $(".user-info form").validate({
        rules: {
            name: {
                required: true,
                minlength: 2
            },
            handle: {
                required: true
            },
            email: {
                required: true,
                email: true
            },
            messages: {
                handle: {
                    required: "Please provide a Github handle"
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