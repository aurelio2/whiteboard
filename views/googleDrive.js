
const CLIENT_ID = '342335205652-ijut8lpop8cs7deteimltn5ldpqnioks.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyBvtBqBgko3yFv5pARzXzuMu8ucL0Edx1w';

      // Discovery doc URL for APIs used by the quickstart
      const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('signout_button').style.visibility = 'hidden';

      const drive = google.drive({
          version: 'v3',
          auth: oauth2Client,
      });
    
      function gapiLoaded() {
        gapi.load('client', intializeGapiClient);
      }


    
      async function intializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

    
      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
      }

      
      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
        }
      }
     
     
      function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          document.getElementById('authorize_button').innerText = 'Refresh';
          await listFiles();
        };

        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          tokenClient.requestAccessToken({prompt: ''});
        }
      }

 
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          document.getElementById('content').innerText = '';
          document.getElementById('authorize_button').innerText = 'Authorize';
          document.getElementById('signout_button').style.visibility = 'hidden';
        }
      }

    
      async function listFiles() {
        let response;
        try {
          response = await gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': 'files(id, name)',
          });
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }
        const files = response.result.files;
        if (!files || files.length == 0) {
          document.getElementById('content').innerText = 'No files found.';
          return;
        }
        // Flatten to string to display
        const output = files.reduce(
            (str, file) => `${str}${file.name} (${file.id}\n`,
            'Files:\n');
        document.getElementById('content').innerText = output;
      }


      //functio to upload file
      async function uploadFile() {
    try{
      const response = await drive.files.create({
            requestBody: {
                name: '2022_SalaryTable.png', //file name
                mimeType: 'image/png',
            },
            media: {
                mimeType: 'image/png',
                body: fs.createReadStream(filePath),
            },
        });  
        // report the response from the request
        console.log(response.data);
    }catch (error) {
        //report the error message
        console.log(error.message);
    }
} 