function submitData() {

    let name1 = document.getElementById("name").value
    let email = document.getElementById("email-input").value
    let phone = document.getElementById("phone-number").value
    let subject = document.getElementById("subject-input").value
    let message = document.getElementById("text-input").value

    console.log(name1);
    console.log(email);
    console.log(phone);
    console.log(subject);
    console.log(message); 



    if (name1 == '') {
        return alert("Masukan nama anda")
    }else if (email == ""){
        return alert("Masukan email anda")
    } else if (phone == ""){
        return alert("Masukan nomor anda")
    } else if (subject == ""){
        return alert("Masukan subject anda")
    } else if (message == ""){
        return alert("Masukan pesan anda")
    }

    


    let emailReceiver ="fedryanbandarisa@gmail.com"

    let a = document.createElement("a")
    
    a.href = "mailto:${emailReceiver}?subject=${subject}&body=Hallo my name ${name}${message} please call me ${phone}"
    
    a.click() 


    let dataObject = {
        nama: name1,
        email: email,
        phoneNumber: phone,
        subject: subject,
        message: message,

    }


    console.log(dataObject);


}








