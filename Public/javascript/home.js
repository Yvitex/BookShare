
$('.owl-carousel').owlCarousel({
    loop:false,
    margin:10,
    nav:false,
    responsive:{
        0:{
            items:1.9
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


$('.carousel').carousel({
    interval: 10000,
})

