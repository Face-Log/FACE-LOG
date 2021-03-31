function sendReqForCustomerData() {
    
    var xhttp = new XMLHttpRequest();
    apiUrl = 'http://localhost:3000/home/customerData';
    
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
            // document.getElementById('newTable').deleteRow();
            constructCustomerTable(this.responseText, 'newTable');
        }
    }

    xhttp.open('GET', apiUrl, true);
    xhttp.send();
}

function sendReqForVisitData() {
    var xhttp = new XMLHttpRequest();
    apiUrl = 'http://localhost:3000/home/visitData';

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
            // document.getElementById('newTable').deleteRow();
            constructVisitTable(this.responseText, 'newTable');
        }
    }

    xhttp.open('GET', apiUrl, true);
    xhttp.send();
}

function sendReqForLocationData() {
    
    var xhttp = new XMLHttpRequest();
    apiUrl = 'http://localhost:3000/home/locationData';

    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
            
            constructLocationTable(this.responseText, 'newTable');
        }
    }

    xhttp.open('GET', apiUrl, true);
    xhttp.send();
}


function constructCustomerTable(data, tableID) {
    
    data = JSON.parse(data);
    var myTable = document.getElementById(tableID);
    myTable.innerHTML = '';
    var headerRow = myTable.insertRow();
    headerRow.setAttribute("class","thead");
    headerRow.insertCell().innerHTML = "Customer ID";
    headerRow.insertCell().innerHTML = "Gender";
    headerRow.insertCell().innerHTML = "Age";
    headerRow.insertCell().innerHTML = "Counter";

    
    data.forEach(element => {
        var row0 = myTable.insertRow();
        row0.insertCell().innerHTML = element.Customer_ID;
        row0.insertCell().innerHTML = element.Gender;
        row0.insertCell().innerHTML = element.Age;
        row0.insertCell().innerHTML = element.Counter;
    });

}

function constructVisitTable(data, tableID) {
    
    data = JSON.parse(data);
    var myTable = document.getElementById(tableID);
    myTable.innerHTML = '';
    var headerRow = myTable.insertRow();
    headerRow.setAttribute("class","thead");
    headerRow.insertCell().innerHTML = "Visit_Date";
    headerRow.insertCell().innerHTML = "Visit_Time";
    headerRow.insertCell().innerHTML = "Customer ID";
    headerRow.insertCell().innerHTML = "Location ID";
    headerRow.insertCell().innerHTML = "New Customer";
    headerRow.insertCell().innerHTML = "Sentiment";
    
    data.forEach(element => {
        var row0 = myTable.insertRow();
        row0.insertCell().innerHTML = element.Visit_Date;
        row0.insertCell().innerHTML = element.Visit_Time;
        row0.insertCell().innerHTML = element.Customer_ID;
        row0.insertCell().innerHTML = element.Location_ID;
        row0.insertCell().innerHTML = element.New_Customer;
        row0.insertCell().innerHTML = element.Sentiment;
    });

}


function constructLocationTable(data, tableID) {
    data = JSON.parse(data);
    var myTable = document.getElementById(tableID);
    myTable.innerHTML = '';
    var headerRow = myTable.insertRow();
    headerRow.setAttribute("class","thead");
    headerRow.insertCell().innerHTML = "Location ID";
    headerRow.insertCell().innerHTML = "Location";
    
    data.forEach(element => {
        var row0 = myTable.insertRow();
        row0.insertCell().innerHTML = element.Location_ID;
        row0.insertCell().innerHTML = element.Location_Name;
    });

}

