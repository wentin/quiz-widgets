



var HuffpostLabsSlidesCntl = function(container) {
    var container = container;
    var slides;
    var currSlideIndex
    var currSlide;
    var nextSlide;

    var percentToNumber = function(percentString) {
        return percentString.split('%')[0];
    }
    var startQuiz = function() {
        transitionSlides();
    }
    var transitionNext = function() {
        animateUp(currSlide, -100, function() {
            currSlideIndex += 1;
            currSlide = slides[currSlideIndex];
            nextSlide = slides[currSlideIndex + 1];
        });
        animateUp(nextSlide, 0);
    };
    var updateLastSlide = function(content) {
        slides[slides.length - 1].innerHTML = content;
    }

    var AnimationStep = 4; // keep it a factor of 100
    var AnimationInterval = 20; //milliseconds
    function animateUp(element, targetTop, callback) {
        var currTop = percentToNumber(element.style.top);
        if (currTop <= targetTop){
            if (callback) { callback(); }
            return;
        }
        
        element.style.top = (currTop - AnimationStep) + "%";
        window.setTimeout(function() {
            animateUp(element, targetTop, callback);
        }, AnimationInterval);
    }

    var init = function() {
        slides = container.getElementsByClassName('slide');
        for(var i=0; i<slides.length; i++) {
            slides[i].style.top = '100%';
        }

        currSlideIndex = 0;
        currSlide = slides[currSlideIndex];
        nextSlide = slides[currSlideIndex + 1];
        currSlide.style.top = '0%';
    }
    init();
    return { transitionNext: transitionNext, updateLastSlide: updateLastSlide };
}

var HuffpostLabsQuizObjectNew = function(container, quizData, mobile, completeCallback) {
    console.log('quizData', quizData)
    var container = container;
    var quizData = quizData;
    var isMobile = mobile;
    var quizID = quizData._id;

    var slidesCntl;

    var questionList;
    var currQuestionIndex;
    var outcomeMap; // {_outcomeID: outcomeObject}
    var leadingOutcome = null;
    var chosenAnswers = [];

    function startQuiz() {
        slidesCntl.transitionNext();
    }
    function answer1() {
        a = questionList[currQuestionIndex].answer1;
        chooseAnswer(a);
    }
    function answer2() {
        a = questionList[currQuestionIndex].answer2;
        chooseAnswer(a);
    }
    function chooseAnswer(answer) {
        chosenAnswers.push(answer);
        incrementOutcome(answer._outcome);
        currQuestionIndex += 1;
        slidesCntl.transitionNext();
    }
    function incrementOutcome(outcomeID) {
        var o = outcomeMap[outcomeID];
        o.points += 1;
        if (!leadingOutcome || o.points > leadingOutcome.points) {
            leadingOutcome = o;
            slidesCntl.updateLastSlide(outcomeContentHTML(o));
        }
        return leadingOutcome;
    }

    function setupSlides() {
        slidesCntl = new HuffpostLabsSlidesCntl(container);
    }
    function createOutcomeMap(outcomeList) {
        map = {};
        for (var i=0; i<outcomeList.length; i++) {
            var o = outcomeList[i];
            o.points = 0;
            map[o._id] = o;
        }
        return map;
    }
    function init(){
        questionList = quizData.questionList;
        currQuestionIndex = 0;
        outcomeMap = createOutcomeMap(quizData.outcomeList);
        console.log('outcomeMap', outcomeMap)

        container.style.display = 'none';
        handleMobile();
        buildWidget();
        setupSlides();

        container.style.display = 'block';
    }

    function handleMobile() {
        if (isMobile) {
            container.className += ' mobile';
        }
    }
    function buildWidget() {
        /* add background image */
        var newClassName = 'quiz-' + quizID;
        container.className += (' ' + newClassName);
        if (quizData.pic_url) {
            addStyle('.' + newClassName + '::after {background-image: url(' + quizData.pic_url + ');}');
        }

        var html = "";
            html+= "<div class='slides-container'>";
            html+= titleContainerHTML();

            var questionList = quizData.questionList;
            for(var i=0; i<questionList.length; i++) {
                html += questionAnswersContainerHTML(questionList[i]);
            }
            html += outcomeContainerHTML();
            html+= "</div>";

        container.innerHTML = html;
    }

    var stylesheet = document.createElement('style');
    document.body.appendChild(stylesheet);
    var addStyle = function(rule) {
        stylesheet.innerHTML += rule;
    }
    function titleContainerHTML() {
        var onclickString = "quizWidgets['" + quizID + "'].startQuiz()";
        var html = "<div class='slide title-container'>";
            html+= "    <div class='filler-left'>";
            html+= "        <img src='/icon/white-square.png' class='filler-square'></img>";
            html+= "    </div>";
            html+= "    <div class='title-content'>";
            html+= "        <h1 class='title'>" + quizData.title + "</h1>";
            html+= "         <div class='share-container'>";
            html+= "            <img src='/designs/images/facebook.png'></img>";
            html+= "            <img src='/designs/images/twitter.png'></img>";
            html+= "            <span class='embed-code'>";
            html+= "                <input value='http://61ad6007.ngrok.com/s' >";
            html+= "                <img src='/designs/images/embed.png'></img>";
            html+= "            </span>";
            html+= "           </div>";
            html+= "        <div class='start-container' onclick=" + onclickString + ">";
            html+= "            <h2 class='start-text'>START</h2>";
            html+= "        </div>";
            html+= "    </div>";
            html+= " </div>";
        return html;
    }
    function answerStyleString(answer) {
        var styleString = "";
        if (answer.pic_url) {
            styleString = "background-image: url(" + answer.pic_url + ")";
        }
        return styleString;
    }
    function questionAnswersContainerHTML(question) {
        var onclickString1 = "quizWidgets['" + quizID + "'].answer1()";
        var onclickString2 = "quizWidgets['" + quizID + "'].answer2()";

        var html = "<div class='slide question-answers-container'>";
            html+= "    <div class='question-container'>";
            html+= "        <h2 class='question-text'>" +  question.text + "</h2>";
            html+= "    </div>";
            html+= "    <div class='answers-container'>";
            html+= "        <div onclick=" + onclickString1 + " style='" + answerStyleString(question.answer1) + "' class='answer-1-container answer-container'>";
            html+= "            <h3 class='answer-text'>" + question.answer1.text + "</h3>";
            html+= "        </div>";
            html+= "        <div onclick=" + onclickString2 + " style='" + answerStyleString(question.answer2) + "' class='answer-2-container answer-container'>";
            html+= "            <h3 class='answer-text'>" + question.answer2.text + "</h3>";
            html+= "        </div>";
            html+= "    </div>";
            html+= "</div>";
        return html;
    }
    function outcomeContentHTML(outcome) {
        var styleText = 'background-image: url(' + outcome.pic_url + ')';
        var html = "<div style='" + styleText + "' class='outcome-content'>";
            html+= "    <h1 class='outcome-text'>" + outcome.text + "</h1>";
            html+= "</div>";
        return html;
    }
    function outcomeContainerHTML() {
        var html = "<div class='slide outcome-container'>";
            html+= "</div>";
        return html;
    }

    init();
    return{ startQuiz: startQuiz,
            answer1:   answer1,
            answer2:   answer2,
            };
}