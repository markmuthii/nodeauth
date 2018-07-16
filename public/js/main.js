$(document).ready(() => {
	//listen for the #searchForm submit event
	$('#searchForm').submit((e) => {
		//prevent default behavior, ie refreshing
		e.preventDefault();
		//get value of word to search
		var searchWord = $('#searchText').val();
		//call function responsible for making api call
		getWordDefinitions(searchWord);
	});
});

//function responsible for making api call
function getWordDefinitions(searchWord) {
	//convert the entered word to lowercase
	searchWord = searchWord.toLowerCase();
	//remove the end spaces if any
	searchWord = removeEndSpaces(searchWord);
	//encode the word in order to pass as an argument in the url
	var ecodedSearchWord = encodeURIComponent(searchWord);
	//merriam webster api key
	var merKey = '3199599e-55e7-4f2d-8401-b0f94267520b';
	//base url for the api call
	var baseUrl = 'https://www.dictionaryapi.com/api/v1/references/collegiate/xml/';
	//full api url which includes the base url, encoded word and api key
	var fullApiUrl = baseUrl + ecodedSearchWord + '?key=' + merKey;
	//make an ajax call to the api, which return xml data
	$.ajax({
		type: 'GET', //type "GET"
		url: fullApiUrl, //the url to make the call
		dataType: 'xml', //data type to be returned
		success: traverseXML, //function to be called upon a successful response //automatically passes the xml data to the function
		error: ajaxError
	});
}

//function to remove spaces from the end of the words, if any
function removeEndSpaces(word) {
	//split the word into an array of individual characters
	var arrWord = word.split('');
	//loop through the array, starting from the end
	for (var i = arrWord.length - 1; i >= 0; i--) {
		//if the value in index i in the array is not a space, return the word as is
		if (arrWord[i] != ' ') {
			return word;
		}else{ //else if the value in index i in the array is a space, create a new word that excludes it
			word = word.slice(0, i);
		}
	}
}

//function to process the received data from the ajax api call. Receives xml
function traverseXML(data) {
	//create an array containing all the entries. Based on the received data
	var entry = $(data).find('entry');
	//hook into the results div found in the dictionary.html file
	var result = $('div.results');
	//get the first def (for definition) tag from the first entry (entry[0])
	var def = $(entry[0]).find('def').first()[0];
	//def will be undefined if the word was not found 
	if (typeof def == 'undefined') {
		//if the result div contained text, remove it first
		result.text("");
		//append an error to the result div telling the person that the word was not found in the database
		result.append(`
			<div class="error missing-word">
				<p class="text-center">Sorry, that word does not exist in our database</p>
			</div>
		`);
		//remove the hidden class to display the error above
		$('div#resultsContainer').removeClass('hidden');
		//end the function here
		return;
	}
	//if a word was found, get the HTML content of def
	def = def.innerHTML;
	//append the HTML content to the result div
	$(result).append(def);
	//filter the results to remove unnecessary content
	filterResult(result);
}

//this function runs if there was an ajax error. Mostly due to lack of an internet connection
function ajaxError(err){
	var result = $('div.results');
	result.text("");
	result.append(`
		<div class="error ajax text-center">
			<p>There was an error processing your request.</p>
			<p>Please check your connection and try again.</p>
		</div>
	`);

	$('div#resultsContainer').removeClass('hidden');
}

//this function filters the contents of the results div to remove unnecessary contents
function filterResult(result){
	//we only need the 'dt' tags which contain the definitions for now
	var dt = result.find('dt');
	//clear the results div
	result.text("");
	//loop through the dt object which contains the definitions we need
	$.each(dt, (i, e) => { //i is index, e is element
		// console.log(e.innerHTML); //console log what will be appended to the results div
		//append the innerHTML of each dt element, each wrapped in paragraph tags. Note the use of backticks(``)
		result.append(`
			<p>${e.innerHTML}</p>
		`);
	})
	//show the results after they have been filtered
	$('div#resultsContainer').removeClass('hidden').fadeIn();

}
