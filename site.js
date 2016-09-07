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
            const result = response.status === 200;
            console.log("SUCCESS", result);
            USERS.set(username, result);
            $(element).trigger("blur");
            checkIfStarred(username);

        }).catch((err) => {
            console.log("ERROR", err);
            USERS.set(username, false);
            $(element).trigger("blur");
        });
    }
    return true;
}

const checkIfRethinkDBInList = (items) => {
    let result = false;
    items.forEach((item) => {
        if (item.full_name.toLowerCase() === "rethinkdb/rethinkdb") {
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
        if (index.indexOf('next') > -1) {
            const rawURL = index.split(';')[0];
            nextPage = rawURL.slice(1, rawURL.length - 1);
            console.log("nextPage", nextPage);
            return;
        }
    });
    return nextPage;
};

const popupMessageBox = (result) => {
  const popup = $('.popup');
  if (result) {
      popup.removeClass('hidden');
      popup.html(`
        <h3>It looks like you've starred us on GitHub!</h3>
        <p>Thanks for your support 😀.</p>
      `);
  } else {
      popup.removeClass('hidden');
      popup.html(`
        <h3>Support RethinkDB on GitHub.</h3>
        <p>Haven't starred us yet? You can do so <a href="https://www.github.com/rethinkdb">here</a>.</p>
      `);
  }
}

function checkIfStarred(username) {
    // Fetch initial page of starred repos for users
    fetch(`https://api.github.com/users/${username}/starred`).then((response) => {
        if (response.status === 200) {

            // Turn initial response into JSON
            response.json().then((data) => {

                let next_page = getNextPage(response.headers);

                // Check if rethinkdb in initial starred repos page
                if (checkIfRethinkDBInList(data)) {
                    // Thanks for starring us on Github
                    popupMessageBox(true);
                    // They did star us
                    next_page = false;
                    return
                }

                let userStarred = false;
                async.whilst(
                    () => {
                        return next_page;
                    },
                    (cb) => {
                        // Fetch next page in starred repos list
                        fetch(next_page).then((response) => {
                            if (response.status === 200) {
                                // Check if next page
                                next_page = getNextPage(response.headers);

                                // Turn results in JSON
                                response.json().then((data) => {
                                    // Check body
                                    if (checkIfRethinkDBInList(data)) {
                                        // They have starred us!
                                        console.log("THANKS FOR STARRING US!");

                                        // Stop running, signal by setting next_page to undefined
                                        next_page = undefined;
                                        userStarred = true;
                                        cb(null, true);
                                    } else {
                                        cb(null, false);
                                    }
                                });
                            } else {
                                console.log("ERROR");
                                cb(null, false);
                            }
                        });
                    },
                    (err, last) => {
                        // Check if they've starred, change text as necessary
                        popupMessageBox(userStarred);
                    }
                );
            });
        }
    });
}

$(document).ready(function() {
    // Show info popup
    // TODO: consider rewriting this to use jQuery's functions to make things a bit easier
    let acc = document.getElementsByClassName("show-popup");
    acc[0].onclick = function() {
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("show");
    };

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
