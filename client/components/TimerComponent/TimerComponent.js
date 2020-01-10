// pass in expiration date/time into new Date()
const timeExpire = new Date("jan 09, 2020 10:03:00").getTime();

const countDown = setInterval(function() { 
    const currentTime = new Date().getTime(); 
    console.log(currentTime)
    const timeLeft = timeExpire - currentTime; 
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24))/(1000 * 60 * 60)); 
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)); 
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000); 
    document.getElementById("timeLeft").innerHTML = `${hours} : ${minutes} : ${seconds}`; 
    if (timeLeft < 0) { 
        clearInterval(x); 
        document.getElementById("timeLeft").innerHTML = "TIME EXPIRED"; 
    } 
}, 1000);