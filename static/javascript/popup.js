window.addEventListener("load", function(){
    setTimeout(
        function open(event){
            document.querySelector(".popup-container")(".popup").style.display = "block";
        },
    )
});


document.querySelector("#close").addEventListener("click", function(){
    document.querySelector(".popup").style.display = "none";
});
document.querySelector("#close").addEventListener("click", function(){
    document.querySelector(".popup-container").style.display = "none";
});