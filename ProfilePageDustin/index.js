$(document).on('click', '.navbar-collapse.in', function (e) {
    if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
        $(this).collapse('hide');
    }
});

$(document).ready(function () {
    $("#experBtn").click(function () {
        $("#container").animate({ left: '-1500px', opacity: '0.1' }, 1500).promise().done(
        function () {
            btnSelector("#experBtn");
            $("#container").load("Experience.html").animate({ left: "0px", opacity: "1" }, 1500);
        });

    });
    $("#completeBtn").click(function () {
        $("#container").animate({ left: '-1500px', opacity: '0.1' }, 1500).promise().done(
            function () {
                btnSelector("#completeBtn");
                $("#container").load("completeWork.html").animate({ left: "0px", opacity: "1" }, 1500);
            });

    });
    $("#skillsBtn").click(function () {
        btnSelector("#skillsBtn");
    });
    $("#servBtn").click(function () {
        btnSelector("#servBtn");
    });
    $("#commentBtn").click(function () {
        btnSelector("#commentBtn");
    })
    $("#webBtn").click(function () {
        btnClear();
        $("#container").animate({ left: "-1500px", opacity: '1' }, 1500).promise().done(
        function () {
            $("#container").load("HomeContent.html").animate({ left: "0px", opacity: "1" }, 1500);
        });
    })

    //$("#experienceBtn").click(function () {
    //    buttonSelector("#experienceBtn");
    //    $("#mainContent").fadeOut(500, 0, newContent);
    //    function newContent() { 
    //        $("#mainContent").fadeIn(1000, 0, document.getElementById("mainContent").innerHTML = "<br/><br/><div class='text-primary'><div class='row'><div class='col-lg-6'><h1><u>Language Experience:</u></h1>" +
    //           "<ul><li>C#</li><li>Microsoft SQL</li><li>Linq to SQL</li><li>Lambda (Linq)</li><li>Javascript</li><li>jQuery</li>" +
    //           "<li>Html</li><li>CSS</li></ul></div><div class='col-lg-6'><br/><p>I have worked in the industry 5 days a week 8+ hours a day for 6 months.</p><br/><p>I work with all these listed languages at work everyday so I have lots of experience with them all.</p></div></div></div></div>")
    //    };
    //});

    //$("#completeWorkBtn").click(function () {
    //    buttonSelector("#completeWorkBtn");
    //    $("#mainContent").fadeOut(500, 0, newContent);
    //    function newContent() {
    //        $("#mainContent").fadeIn(1000, 0, document.getElementById("mainContent").innerHTML = "<br/><br/><div class='text-primary'>This is my completed work page. </div>")
    //    };
    //});

    $("#homeBtn").click(function () {
        buttonSelector("#homeBtn");
        $("#mainContent").fadeOut(500, 0, newContent);
        function newContent() {
            $("#mainContent").fadeIn(1000,0,  document.getElementById("mainContent").innerHTML = "<br /><br />" +
                            "<p>Welcome to my profile page. This page is dedicated to my work and experience with Software and WebApp Development. " +
                            "I got my start on October 15th, 2015 when the company I was working for took a chance on me. " +
                            "I worked 10 hour days for months trying to learn how to program. I was blessed because I was getting paid to learn but " +
                            "I also had work I needed to do so it forced me to learn quickly.</p><br />" +
                            "<p>I realized quickly I had found something I really enjoyed and wanted to learn as much as I could. " +
                            "I had found other things in life i enjoyed but I never really felt like it was something I would want to do for a living.</p><br />" +
                            "<p>My goal with this page is to help you learn who I am and how committed I am to everything in my life.</p>")
        };
    })

    //$("#recomendedBtn").click(function () {
    //    buttonSelector("#recomendedBtn");
    //    $("#mainContent").fadeOut(500, 0, newContent);
    //    function newContent() {
    //        $("#mainContent").fadeIn(1000,0, document.getElementById("mainContent").innerHTML = "<br /><br /><div>This is my Recommended Resource Page</div>")
    //    };
    //});

    //$("#workHistoryBtn").click(function () {
    //    buttonSelector("#workHistoryBtn");
    //    $("#mainContent").fadeOut(500, 0, newContent);
    //    function newContent() {
    //        $("#mainContent").fadeIn(1000,0, document.getElementById("mainContent").innerHTML = "<br /><br /><div>This is my Work History Page</div>")
    //    };
    //});

    //$("#hobbiesBtn").click(function () {
    //    buttonSelector("#hobbiesBtn");
    //    $("#mainContent").fadeOut(500, 0, newContent);
    //    function newContent() {
    //        $("#mainContent").fadeIn(1000,0, document.getElementById("mainContent").innerHTML = "<br /><br /><div>Hobbies page</div>")
    //    }
    //});

    //$("#myServicesBtn").click(function () {
    //    buttonSelector("#myServicesBtn");
    //    $("#mainContent").fadeOut(500, 0, newContent);
    //    function newContent() {
    //        $("#mainContent").fadeIn(1000,0, document.getElementById("mainContent").innerHTML = "<br /><br /><div>Services Page</div>")
    //    }
    //});

    //$("#commentsBtn").click(function () {
    //    buttonSelector("#commentsBtn");
    //    $("#mainContent").fadeOut(500, 0, newContent);
    //    function newContent() {
    //        $("#mainContent").fadeIn(1000,0, document.getElementById("mainContent").innerHTML = "<br /><br /><div>Comments Page</div>")
    //    }
    //});

    var buttonSelector = function (self) {
        $(".active").children().addClass("buttonClass");
        $(".active").removeClass("active");
        $(self).parent().addClass("active");
        $(self).removeClass("buttonClass");
    }

    var btnSelector = function (self) {
        $(".active").removeClass("active");
        $(self).parent().addClass("active");
    }

    var btnClear = function () {
        $(".active").removeClass("active");
    }

    var visiblity = function (contentID) {
        $(".visible").removeClass("visible").addClass("visible-hidden");
        $(contentID).removeClass("visible-hidden").addClass("visible");
    };
})
