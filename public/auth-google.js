
function handleCredentialResponse(response) {
    //parte das resposta do google

    const data = jwt_decode(response.credential)
    console.log(data);

    fullName.textContent = data.name
    email.textContent = data.email
    picture.setAttribute("src", data.picture)
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "342335205652-ijut8lpop8cs7deteimltn5ldpqnioks.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }  // customization attributes
    );

    google.accounts.id.prompt(); // also display the One Tap dialog
}


/// google driver