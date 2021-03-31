var chart = require('chart.js');

// var apiUrl;

var data;
var input2;
var type1;
function sendReqforChart(type, input1,date) {
    
    input2 = input1;
    var xhttp = new XMLHttpRequest();
    
    if (date!=null){
        // var end = window.location.href.indexOf("#");
        // newUrl = window.location.href.substring(0,end);
        // window.location.href = newUrl;
        // apiUrl = window.location.href + "?date="+date;
        apiUrl = 'http://localhost:3000/home/'+input1+"?date="+date;
    }

    else{
    apiUrl = 'http://localhost:3000/home/'+input2;
    }
    console.log(apiUrl);
    chartOptions = document.getElementById("chartOptions");
    chartOptions.style.display = 'inline-block';
    
    
    type1 = type;
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            data = this.responseText;
            document.getElementById("chartType").setAttribute("onchange", "displayChart(data,this.value)");
            document.getElementById("date").setAttribute("onchange", "sendReqforChart(type1, input2, this.value)");
            displayChart(this.responseText,type);
        }
    }

    xhttp.open('GET', apiUrl, true);
    xhttp.send();
}

function displayChart(data, type) {
    data = JSON.parse(data);
    console.log(input2);
    let count = [];
    if(input2 == "maleVfemale"){
        labels = ['MALE', 'FEMALE'];
        label = 'MALE VS FEMALE';
        yLabelString = 'Counter';
        xLabelString = 'GENDER';
        
        data.forEach(function (element) {
            count.push(element.MALE);
            count.push(element.FEMALE);
        });
    }

    if(input2 == "sentimentStatistics"){
        labels = ['HAPPY', 'SAD', 'NEUTRAL', 'FEAR', 'ANGRY'];
        label = 'Sentiment Statistics';
        yLabelString = 'Counter';
        xLabelString = 'Sentiments';
        
        data.forEach(function (element) {
            count.push(element.Happy);
            count.push(element.Sad);
            count.push(element.Neutral);
            count.push(element.Fear);
            count.push(element.Angry);
        });
    }

    if(input2 == "newVold"){
        labels = ["NEW CUSTOMER", "REPEATED CUSTOMER"];
        label = 'New Customer Vs Repeated Customer';
        yLabelString = 'Counter';
        xLabelString = 'Customer Type';
        data.forEach(function (element) {
            count.push(element.NEW);
            count.push(element.REPEATED);
            
        });
    }

    if(input2 == "ageDistribution"){
        labels = ["0-2","4-6","6-8","8-12", "15-20", "25-32", "38-43", "48-53", "60-100"];
        label = "Age Distribution";
        yLabelString = 'Counter';
        xLabelString = 'Ages';
        data.forEach(function(element){
            count.push(element.Age1);
            count.push(element.Age2);
            count.push(element.Age3);
            count.push(element.Age4);
            count.push(element.Age5);
            count.push(element.Age6);
            count.push(element.Age7);
            count.push(element.Age8);
            count.push(element.Age9);
        });
    }

    
    
    var myCanvas = document.getElementById('myCanvas').getContext('2d');

    
    if (window.graph != undefined) {
        window.graph.destroy();
    }
    window.graph = new Chart(myCanvas, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: count,
                borderWidth: 4,
                backgroundColor: '#00aeff',
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yLabelString,
                        fontSize: 16,
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xLabelString,
                        fontSize: 16,
                    }
                }]
            },
            
        }
    });

}