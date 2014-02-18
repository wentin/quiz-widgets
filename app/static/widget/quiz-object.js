
var HuffpostLabsQuizObject = function(container, quizData, completeCallback) {
	/* when the quiz is complete I'll send back data 
		worthwhile data: 
			list of chosen answers chosenAnswers = []
			which outcome resulted

			have map: {_outcomeID: outcomeObject}
			Each time an answer is chosen, 
				onclick='chooseAnswer1()' or onclick='chooseAnswer2()'
				a = currQuestion.answer1  or a = currQuestion.answer2
				chosenAnswers.push(a)
				incrementOutcome(a.outcome)

			leadingOutcome = null
			outcomesMap = {_outcomeID: outcomeObject}
			function incrementOutcome(outcomeID):
				o = outcomesMap[outcomeID]
				o.points += 1
				if o.points > leadingOutcome.points:
					leadingOutcome = o
				
	*/
	var quizID = quizData._id;
	var quizIDString = quizID.toString();
	var questionList;
	var currQuestion;
	var nextQuestion;

	var outcomeMap; // {_outcomeID: outcomeObject}
	var leadingOutcome = null;
	var chosenAnswers = [];

	var containers;
	var currIndex = 0;
	var lastContainerIndex;
	this.swipeController;

	var init = function() {
		buildWidgetSkeleton(container, quizData.title);
		containers = document.getElementsByClassName('swipe-slide');
		lastContainerIndex = containers.length - 1;

		questionList = quizData.questionList;
		currQuestion = questionList.shift();
		nextQuestion = questionList.shift();
		outcomeMap = createOutcomeMap(quizData.outcomeList);

		fillSlideContainer(0, buildQuestionContent(currQuestion));
		setupNextQuestion(nextQuestion, 0);

		enableSwipe();
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
	function incrementOutcome(outcomeID) {
		var o = outcomeMap[outcomeID];
		o.points += 1;
		if (!leadingOutcome || o.points > leadingOutcome.points) {
			leadingOutcome = o;
		}
		return leadingOutcome;
	}
	function chooseAnswer(answer) {
		chosenAnswers.push(answer);
		incrementOutcome(answer._outcome);
	}
	function chooseAnswer1() {
		a = currQuestion.answer1;
		chooseAnswer(a);
	}
	function chooseAnswer2() {
		a = currQuestion.answer2;
		chooseAnswer(a);
	}
	function setupNextContent(index, content) {
	  var indexLeft = (index > 0) ? (index-1) : lastContainerIndex;
	  var indexRight = (index < lastContainerIndex) ? (index + 1) : 0;

	  fillSlideContainer(indexLeft, content);
	  fillSlideContainer(indexRight, content);
	}

	function setupOutcome(index) {
		console.log(outcomeMap)
		var outcomeContent = buildOutcomeContent(leadingOutcome);
		setupNextContent(index, outcomeContent);
	}
	function setupNextQuestion(nextQuestion, index) {
	  var questionContent = buildQuestionContent(nextQuestion);
	  setupNextContent(index, questionContent);
	}
	function enableSwipe() {
		this.swipeController = Swipe(document.getElementById('swipe-container'), {
			startSlide: currIndex, // always 3 slides
			//auto: 3000,
			continuous: true,
			disableScroll: true,
			stopPropagation: true,
			callback: swipeStart,
			transitionEnd: swipeEnd,
		});
		window.swipeControllers[quizIDString] = this.swipeController;
	}
	function disableSwipe() {
		window.swipeControllers[quizIDString] = null;
	}

	function swipeStart(index, elem) {
		if (index == (currIndex + 1) || index == 0) {
			chooseAnswer2();
		} else {
			chooseAnswer1();
		}
	}
	var lastSwipe = false;
	function swipeEnd(index, elem) {
		currIndex = index;
	  	if (lastSwipe) {
	  		handleQuizEnd();
	  		return;
	  	}
	  	currQuestion = nextQuestion;
		nextQuestion = questionList.shift();
		if (!nextQuestion) {
			lastSwipe = true;
			setupOutcome(index);
		} else {
			setupNextQuestion(nextQuestion, index);
		}
	}
	function handleQuizEnd() {
  		disableSwipe();
  		if (completeCallback) { completeCallback(leadingOutcome, chosenAnswers); }
	}


	function fillSlideContainer(index, content) {
	  containers[index].innerHTML = content;
	}


	function swipeControllerString() {
		return "swipeControllers['" + quizIDString + "']";
	}
	function buildQuestionContent(question) {
		var swipeController = swipeControllerString();
		var html = '<div class="question">';
		html 	+= '	<div onclick="' + swipeController + '.prev()" class="answer answer-left">';
		html 	+= '  		<img class="answer-img" src="' + question.answer1.pic_url + '"></img>';
		html 	+= '	   	<div class="answer-text">';
		html 	+= '	    <p>' + question.answer1.text + '</p>';
		html 	+= '	    <p>&larr;</p>';
		html 	+= '	  </div>';
		html 	+= '	</div>';
		html 	+= '	<div class="question-text">';
		html 	+= '	<p>' + question.text + '</p>';
		html 	+= '	</div>';
		html 	+= '	<div onclick="' + swipeController + '.next()" class="answer answer-right">';
		html 	+= '	  <img class="answer-img" src="' + question.answer2.pic_url + '"></img>';
		html 	+= '	  <div class="answer-text">';
		html 	+= '	    <p>' + question.answer2.text + '</p>';
		html 	+= '	    <p>&rarr;</p>';
		html 	+= '	  </div>';
		html 	+= '	</div>';
		html 	+= '	</div>';
	  	return html;
	}
	function buildWidgetSkeleton(container, quizTitle) {
		var html = '<p class="quiz-title">' + quizTitle + '</p>';
		html 	 += '<div id="swipe-container" class="swipe swipe-container">';
		html 	 += '	<div class="swipe-wrap">';
		html 	 += 		'<div class="swipe-slide"></div>';
		html 	 += 		'<div class="swipe-slide"></div>';
		html 	 += 		'<div class="swipe-slide"></div>';
		html 	 += '</div>';
		container.innerHTML = html;
	}
	function buildOutcomeContent(outcome) {
		var html = '<div class="outcome">';
		html 	+= '    <img class="outcome-img" src="' + outcome.pic_url + '"></img>';
    	html 	+= '	<p class="outcome-text">' + outcome.text + '</p>';
    	html 	+= '</div>';
		return html;
	}
	init();
}