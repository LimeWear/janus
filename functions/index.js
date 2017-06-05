
// Declare global requirements 
var functions = require('firebase-functions');
var admin = require('firebase-admin');

// Initialize the adminDatabase connection 
admin.initializeApp(functions.config().firebase);


// Function: setName 
exports.setName = functions.database.ref('/{shop}/Person/{person}/info/name')
  .onWrite(event => {

    // Grab the current contactID that was written to the Database and set other vars
    const personName = event.data.val();
    const oldPersonName = event.data.previous.val();
    const shopID = event.params.shop;
    const personID = event.params.person;
    const personPath = '/' + shopID + '/Person/' + personID;

    console.log('SetName', 'PersonID: ' + personID, 'personName: ' + personName, 'OldPersonName: ' + oldPersonName);    


    if (event.data.changed()){ 
        console.log('Name Changed', event.data.changed());

        // Get the contact obj from the adminDatabase
        
          // Init the data that will be written to the adminDatabase
          var data = {};

          data[personPath + '/info/name'] = {};
          if (personName.first)   data[personPath + '/info/name']['first']  = personName.first;
          if (personName.last)   data[personPath + '/info/name']['last']  = personName.last;
          if (personName.first && personName.last)   data[personPath + '/info/name']['full']  = personName.first + ' ' + personName.last;
          if (personName.middle)   data[personPath + '/info/name']['middle']  = personName.middle;
          if (personName.nickname)   data[personPath + '/info/name']['nickname']  = personName.nickname;
          if (personName.salutation)   data[personPath + '/info/name']['salutation']  = personName.salutation;
          
          // Write changed to the adminDatabase (return a Promise)
          return event.data.adminRef.root.update(data);

          
        } else {
          console.log('Name Unchanged', event.data.changed());
          return null;
        }


  });


// Function: setEmail
// When a user sets their primary email with a ContactID pull info fron the contact obj
exports.setEmail = functions.database.ref('/{shop}/Person/{person}/info/email/id')
  .onWrite(event => {

      // Grab the current contactID that was written to the Database and set other vars
      const contactID = event.data.val();
      const oldContactID = event.data.previous.val();
      const shopID = event.params.shop;
      const personID = event.params.person;
      const personPath = '/' + shopID + '/Person/' + personID;

      console.log('SetEmail', 'PersonID: ' + personID, 'ContactID: ' + contactID, 'OldContactID: ' + oldContactID);

      // Only sync contact data if the contactID has been changed.
      if (event.data.changed()){ 
        console.log('Email ID Changed', event.data.changed());

        // Get the contact obj from the adminDatabase
        admin.database().ref(personPath + '/contact/' + contactID)
          .once('value').then(contactObj => {

            var contact = contactObj.val(); 
            console.log('getContactObj', contact);

            // If contact type is not email, set to old contactID
            if (contact.type != 'email' && oldContactID) {
              return event.data.adminRef.parent.update({'id': oldContactID});
            }

            // Init the data that will be written to the adminDatabase
            var data = {};

            data[personPath + '/info/email'] = {};
            if (contact.name)   data[personPath + '/info/email']['name']  = contact.name;
            if (contact.note)   data[personPath + '/info/email']['note']  = contact.note;
            if (contactID)      data[personPath + '/info/email']['id']    = contactID;
            if (contact.value)  data[personPath + '/info/email']['address'] = contact.value;

            // Add contactObj to the primary email obj
            data[personPath + '/contact/' + contactID + '/primary'] = true;

            // Unset the old primary contact as the primary email
            if (oldContactID) data[personPath + '/contact/' + oldContactID + '/primary'] = null;
            
      
            // Write changed to the adminDatabase (return a Promise)
            return event.data.adminRef.root.update(data);
          });
          
        } else {
          console.log('Email ID Unchanged', event.data.changed());
          return null;
        }

  });


exports.importCustomers = functions.storage.object().onChange(event => {
  //const gcs = require('@google-cloud/storage')();
  var csvParse = require('csv-parse');

  var data = event.data;


  console.log('CSV Added: ', data);


  return;
});







