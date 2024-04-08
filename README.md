# Mr. Listr

## 1. Project Description

A universal web application that allows digitalizing of grocery lists and trips to help you track and manage your grocery spending.

## 2. Names of Contributors

-   Hi, my name is Ole Lammers! A 20 year old self taught developer studying at BCIT.
-   Hi, my name is Tanner Parkes. I'm a 31 year old dude that is new to most of this.
-   Hugo Amuan: 22 year old dude

## 3. Technologies and Resources Used

-   HTML, CSS, JavaScript
-   Bootstrap 5 (Frontend library)
-   Firebase 8 (BAAS - Backend as a Service)
-   Sweetalert 2 / Sweetalert 2 Bootstrap
-   unDraw

## 4. Complete setup/installion/usage

This is a vanilla web project, you can live serve the root directory and visit the served index.html. From there you can navigate throughout all the pages.

## 5. Known Bugs and Limitations

-   Lists cannot be filtered
-   Trip history cannot be viewed, but it is used in analytics
-   FAQ pages do not redirect anywhere
-   The contact form does not create database records

## 6. Features for Future

-   Proper trip history page
-   Page loaders and more loading feedback
-   Refined time graphs for analytics

## 7. Contents of Folder

```
Root Folder:
├── .gitignore               # Git ignore file
├── .firebaserc              # Firebase hosting related file
├── firebase.json            # Firebase hosting related file
├── firestore.indexes.json   # Firebase hosting related file
├── firestore.rules          # Firebase hosting related file
├── storage.rules            # Firebase hosting related file
├── index.html               # landing HTML file, this is what users see when you come to url
├── main.html                # the home page HTML file, for a logged in user
├── 404.html                 # Firebase generated 404 page file
├── account.html             # account information HTML file, this is where users go to edit their account data
├── contact.html             # contact form page HTML file, this is where users go to contact support
├── contact2.html            # contact form "Thank You" notice page HTML file
├── insights.html            # insights page HTML file, this is where users go to see shopping trip insights
├── items.html               # items page HTML file, this is where users go to view all of their items and edit them
├── login.html               # login page HTML file, this is where new or returning users go if they were logged out
├── password.html            # password change page HTML file, this is where users go to change their password
├── settings.html            # settings page HTML file, this is where users go to log out or change any settings
├── trip.html                # shopping trip page HTML file, this is where users go to go on a shopping trip
└── README.md                # (this file)

Subfolders:
├── .git                                        # holds Git repository information
├── faqs                                        # holds FAQs related pages
    /faq.html                                   # question answer page, this is where users go to find the answer for a frequent question
    /index.html                                 # frequently asked question page, this is where users go to see all the questions that have been catalogued and answered
├── items                                       # holds items sub-related pages
    /create_items.html                          # the create item page, this is where users go to create a new saved item
├── lists                                       # holds list related pages
    /create.html                                # the list create page, this is where a user goes to create a new list
    /edit.html                                  # the list edit page, this is where a user goes to modify items on a list and change list details
    /index.html                                 # the all lists page, this is where a user goes to view lists they have created
    /list.html                                  # the single list page, this is where a user goes to view list items and details
├── images                                      # holds project image assets
    /faq-main.svg                               # sourced from unDraw, used for the FAQ page header image
    /insights-main.svg                          # sourced from unDraw, used for the insights page header image
├── scripts                                     # holds project Javascript scripts
    ├── firestore-utils                         # holds general JS files that export functions to help with firestore interactions
        /item-helpers.js                        # holds general logic for manipulating and accessing items from Firestore
        /list-helpers.js                        # holds general logic for manipulating and accessing lists from Firestore
        /trip-helpers.js                        # holds general logic for manipulating and accessing trips from Firestore
    ├── popup-utils                             # holds general JS files that export functions useful for prompts throughout the website
        /item-prompt.js                         # holds the logic for the select item popup
    └── skeletons                               # holds HTML snippet files to insert throughout the website
        /navigation.xml                         # the HTML snippet for the navigation bar
        /prompt-editable-selectable-item.xml    # the HTML snippet for the temporary item entry in the select item popup
        /prompt-selectable-item.xml             # the HTML snippet for the saved item entry in the select item popup
    /authentication.js                          # holds logic for the login / signup page
    /create-items.js                            # holds logic for the create items page
    /create-list.js                             # holds logic for the create list page
    /edit_account.js                            # holds logic for the account information edit page
    /edit_password.js                           # holds logic for the password change page
    /edit-list.js                               # holds logic for the edit list page
    /firebaseAPI_BBY8.js                        # holds logic to initiate a Firebase connection and has some utilities for other files that interact with Firebase to use
    /footer.js                                  # holds interaction logic for the footer used on the contact page
    /insights.js                                # holds logic for the insights page
    /items.js                                   # holds logic for the all items page
    /list.js                                    # holds logic for the singular list page
    /load-dynamic-navigation.js                 # holds logic to load and render the navigation bar throughout all pages of the website
    /main.js                                    # holds logic for the logged in user homepage
    /settings.js                                # holds logic for the settings page
    /trip.js                                    # holds logic for the shopping trip page
└── styles                                      # holds project CSS stylesheets
    /contact.css                                # holds the styles for the contact page
    /faqs.css                                   # holds the styles for the FAQ page
    /global.css                                 # holds generalized styles and reset used accross all pages
    /insights.css                               # holds the styles for the insights page
    /items.css                                  # holds the styles for the all items page
    /login.css                                  # holds the styles for the login page
    /main.css                                   # holds the styles for the homepage
```
