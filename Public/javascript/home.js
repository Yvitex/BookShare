
$('.owl-carousel').owlCarousel({
    loop:false,
    margin:10,
    nav:false,
    responsive:{
        0:{
            items:2
        },
        600:{
            items:3
        },
        1000:{
            items:5
        }
    }
})

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(TextPlugin);

gsap.timeline()
    .from(".intro", {
        text: "",
        duration: 4,
        delay: 0.3
    })
    .from(".animate-button", {
        y: 100,
        opacity: 0
    })

gsap.from(".box2", {
    y:"100px", stagger: 0.3, opacity: 0, duration:1.4, ease: "Back.easeOut",
    scrollTrigger: {
        trigger: ".box2",
        start: "top 75%"
    }
})


// Sign Up and Log In Animation
$(".animate-button, .top-login").click(()=> {
    gsap.set(".login-page", {autoAlpha: 1});
    gsap.fromTo(".login-page", {y: 250, opacity: 0}, {y: 0, opacity: 100, duration:0.5} )
})

$(".close-login").click(()=> {
    gsap.fromTo(".login-page", {y: 0, opacity: 1}, {y: 250, opacity: 0, autoAlpha: 0, duration:0.5} )
})

$(".sw-signup").click(()=> {
    gsap.set(".signup-page", {autoAlpha: 1});
    gsap.timeline()
        .fromTo(".login-page", {y: 0, opacity: 1}, {y: 250, opacity: 0, autoAlpha: 0, duration:0.5} )
        .fromTo(".signup-page", {y: 250, opacity: 0}, {y: 0, opacity: 100, duration:0.5} )
})

$(".sw-login").click(()=> {
    gsap.set(".login-page", {autoAlpha: 1});
    gsap.timeline()
        .fromTo(".signup-page", {y: 0, opacity: 1}, {y: 250, opacity: 0, autoAlpha: 0, duration:0.5} )
        .fromTo(".login-page", {y: 250, opacity: 0}, {y: 0, opacity: 100, duration:0.5} )
})

$(".close-signup").click(()=> {
    gsap.fromTo(".signup-page", {y: 0, opacity: 1}, {y: 250, opacity: 0, autoAlpha: 0, duration:0.5} )
})

let id = null;

$(".bi-trash-fill").click((event) => {
    console.log(event.currentTarget.id)
    id = event.currentTarget.id
    gsap.set(".confirmation", {autoAlpha: 1});
    gsap.fromTo(".confirmation", {y: -100, opacity: 0}, {y: 10, opacity: 1, duration: 0.2});
    $("body").addClass("stop-scrolling");
})

$(".bi-x-square-fill").click(() => {
    gsap.to(".confirmation", {y: -100, opacity: 0, duration: 0.2});
    $("body").removeClass("stop-scrolling");
})

$(".bi-check-square-fill").click(function(){
     fetch("/delete/" + id, {method: "DELETE"}).then(() => {
        $("#refresh").load(window.location.href + " #refresh");
        setTimeout(() => {location.reload()}, 500)
    })
})

$(".change-profile-btn").hover(function() {
    console.log("in")
    gsap.fromTo(".change-profile-btn", {opacity: 0}, {opacity: 1, duration: 0.2})
}, function() {
    console.log("out")
    gsap.fromTo(".change-profile-btn",{opacity: 1, duration: 0.2}, {opacity: 0});
})

// Here lies the pagination settings
let pagination = document.querySelector(".pagination-container ul");
let totalPagerist = document.querySelector("#total");
let currentPage = document.querySelector("#currentPage");
let totalPage = parseInt(totalPagerist.textContent);
let searchBarContainer = document.querySelector("#search-button");
let searchBar = document.querySelector("#search");
let previousSearch = document.querySelector("#previousSearch");

let page = parseInt(currentPage.textContent);
previousSearch = previousSearch.textContent;
let limit = 25;
var searchKey = "all";



if (previousSearch == ""){
    previousSearch = "all";
}

searchBar.addEventListener("input", (event) => {
    searchKey = event.target.value;
    console.log("entering")
    if(searchKey == ""){
        searchKey="all";
    }
    console.log(searchKey)
    searchBarContainer.innerHTML = `<a href="/browse/${searchKey}/1/${limit}"><i class="bi bi-search"></i></a>`
})


window.element = element;



function element(page, totalPage){
    console.log(search)

    let divs = '';
    let before = page - 1;
    let after = page + 1;

    console.log("totalPage: " + totalPage)

    if(before < 0){
        before += 1;
    }

    if(page > 1){
        divs += `<a href="/browse/${previousSearch}/${page - 1}/${limit}"><li onclick="element(${page - 1}, ${totalPage})"><div class="pagination-number controller"><i class="bi bi-chevron-left"></i>Prev</div></li></a>`;
    }

    if(page > 2){
        divs += `<a href="/browse/${previousSearch}/1/${limit}"><li onclick="element(1, ${totalPage})"><div class="pagination-number">1</div></li></a>`;
        if(page > 3){
            divs += `<li><div class="pagination-number">...</div></li>`;
        }
    }

    for (let pages = before; pages <= after; pages++){
        if(pages == 0){
            pages += 1;
        }
        if(pages > totalPage){
            continue;
        }
        divs += `<a href="/browse/${previousSearch}/${pages}/${limit}"><li onclick="element(${pages}, ${totalPage})"><div class=${pages == page ? "button-active pagination-number" : "pagination-number" }>${pages}</div></li></a>`
    }

    if(page < totalPage - 1){
        if(page < totalPage - 2){
            divs+=`<li><div class="pagination-number">...</div></li>`;
        }
        divs += `<a href="/browse/${previousSearch}/${totalPage - 1}/${limit}"><li onclick="element(${totalPage}, ${totalPage})"><div class="pagination-number">${totalPage}</div></li></a>`
        
    }

    if(page + 1 < totalPage){
        divs += `<a href="/browse/${previousSearch}/${page + 1}/${limit}"><li onclick="element(${page + 1}, ${totalPage})"><div class="pagination-number controller"><i class="bi bi-chevron-right"></i>Next</div></li></a>`;
    }

    pagination.innerHTML = divs;

}

element(page + 1, Math.ceil(totalPage / limit));




$('.carousel').carousel({
    interval: 10000,
})

