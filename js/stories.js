"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showRemoveBtn=false) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser)
  return $(`
      <li id="${story.storyId}">
        <div>
        ${showRemoveBtn ? getRemoveBtn() : ""}
        ${showStar ? getStar(story) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
      <hr>
    `);
}


function getRemoveBtn() {
  return`
      <span class="trash-can">
         <i class="fas fa-trash-alt"></i>
      </span>`
}

function getStar(story) {
  const isFavorite = currentUser.isFavorite(story)
  const starType = isFavorite ? "fas" : "far"
  return `
    <span class="star">
       <i class="${starType} fa-star"></i>
    </span>`
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

 async function addUserStoryOnPage(e){
  e.preventDefault()
  let $author = $("#author-name").val()
  let $title = $("#title").val()
  let $url = $("#url").val()
  let user = currentUser
  let story = await storyList.addStory(user, {
    title: $title,
    author: $author,
    url: $url
  })
  let $story = generateStoryMarkup(story)
  $allStoriesList.prepend($story)
  $("input").val('')
  $submitForm.slideUp('slow')
}
$submitForm.on("submit", addUserStoryOnPage)


async function deleteStory(e) {
  const $target = $(e.target)
  const $closeLi = $target.closest('li')
  const storyId = $closeLi.attr('id')
  await storyList.removeStory(storyId)
  putMyStoriesOnListPage()
}
$ownStories.on("click", ".trash-can", deleteStory)


function putMyStoriesOnListPage(){
  let myStories = currentUser.ownStories
  $ownStories.empty()
  if(myStories.length === 0){
    $ownStories.append("<h5>No stories yet!</h5>")
  } else {
    for (const story of myStories) {
      const $story = generateStoryMarkup(story, true)
      $ownStories.append($story)
    }
  }
  $ownStories.show()
}

async function putFavoriteStoryOnPage() {
  let favoriteStories = currentUser.favorites
  $favoriteStories.empty()
  if(favoriteStories.length == 0){
    $favoriteStories.append("<h5>No favoritess yet!</h5>")
  }else {
    for(let story of favoriteStories){
      const $story = await generateStoryMarkup(story)      
      $favoriteStories.append($story)
    }
  }

  $favoriteStories.show()
}

async function toggleFavorite(e) {
  const $target = $(e.target)
  const $closeLi = $target.closest("li")
  const storyId = $closeLi.attr("id")
  const story = storyList.stories.find((s)=> s.storyId === storyId)

  if($target.hasClass("fas")) {
    await currentUser.removeFavorite(story)
    $target.closest("i").toggleClass("fas far")
  }else {
    await currentUser.addFavorite(story)
    $target.closest("i").toggleClass("fas far")
  }
}

$(document).on("click", '.star', toggleFavorite)