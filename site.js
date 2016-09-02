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
        }).then(function(response) {
            const result = response.status === 200 || response.status === 304;
            console.log("SUCCESS", result);
            USERS.set(username, result);
            $(element).trigger("blur");

            // Check if any items that have been starred is rethinkdb/rethinkdb
            const checkIfStarredRethinkDB = (items) => {
              let result = false;
              items.forEach((item) => {
                  if (item.full_name.toLowerCase() === "rethinkdb/rethinkdb"){
                    result = true;
                  };
              });
              return result;
            };

            // Function for getting the 'next' page out of Github's weird pagination
            const getNextPage = (headers) => {
              let nextPage;
              if (!headers.has('Link')) return nextPage;
              headers.get('Link').split(',').forEach((index) => {
                if (index.indexOf('next') > -1){
                  console.log(index);
                  const rawURL = index.split(';')[0];
                  nextPage = rawURL.slice(1, rawURL.length - 1);
                  console.log("nextPage", nextPage);
                  return;
                }
              });
              return nextPage;
            };

            // Only search for if we've starred if result is successful
            if (result) {
              fetch(`https://api.github.com/users/${username}/starred`).then((response) => {
                if (response.status === 200 || response.status === 304) {
                    response.json().then((data) => {
                      if (checkIfStarredRethinkDB(data)){
                        // Thanks for starring us on Github
                        console.log("THANKS FOR STARRING US!, BEGIN")
                        return
                      }
                      let next_page = getNextPage(response.headers);
                      let count = 1;

                      async.whilst(
                        () => { return next_page },
                        (cb) => {
                          fetch(next_page).then((response) => {
                            if (response.status === 200){
                                count++;
                                // Check if next page
                                next_page = getNextPage(response.headers);

                                response.json().then((data) => {
                                  // Check body
                                  if (checkIfStarredRethinkDB(data)){
                                    // They have starred us!
                                    console.log("THANKS FOR STARRING US!")
                                    $('.popup').removeClass('hidden');

                                    // Stop running, signal by setting next_page to undefined
                                    next_page = undefined;
                                    cb(null, true);
                                  } else {
                                    cb(null, false);
                                  }
                                }).catch((err) => {
                                  cb(err, false);
                                });
                            } else {
                              console.log("ERROR", response.status_code);
                              cb(null, false);
                            }
                          }).catch((err) => { cb(err, false) });
                        },
                        (err, final) => {
                          console.log('final', final)
                          return
                        }
                      );
                    });
                    console.log("PLEASE STAR US! END")
                    const popup = $('.popup');
                    popup.html(`<h1>Hey Please star Us!</h1>`);
                    popup.removeClass('hidden');
                    return
                  };
              });
            }
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
    let acc = document.getElementsByClassName("show-popup");
    acc[0].onclick = function() {
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("show");
    };

    // $('.some-class').click(function() {
    //     $('.popup', $(this).parent()).toggleClass('active');
    // })
    /* Collect personal details from user:
    - validate and submit form on input
    - TODO: add required fields to `name` */
    $.validator.addMethod("githubUsernameCheck", function(value, element) {
        return lookupUser(value, element);
    }, 'Please provide a valid Github handle.');

    $.validator.addMethod("stateCheck", function(value, element) {
        return value !== "State"
    }, 'Please select a state.');

    jQuery.validator.addMethod("zipcode", function(value, element) {
        return this.optional(element) || /^\d{5}(?:-\d{4})?$/.test(value);
    }, "Please provide a valid zipcode.");

    $(".form-container form").validate({
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
                email: true,
            },
            state: {
                required: true,
                stateCheck: true,
            },
            address1: {
                required: true
            },
            city: {
                required: true
            },
            zip: {
                required: true,
                zipcode: true
            },
            messages: {
                github: {
                    required: "Please enter a Github username",
                    // depends: "Please provide a valid Github username",
                }
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
