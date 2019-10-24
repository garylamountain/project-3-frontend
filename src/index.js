let CURRENT_USER = '';
let ALL_USERS = [];

function main(){
    document.addEventListener('DOMContentLoaded', function(){
        while(CURRENT_USER == ''){
            signIn();
        }
        fetchUser(CURRENT_USER);
        document.querySelector('#new-post-submit').addEventListener('click', function(e) {
            e.preventDefault();
            if(e.target.parentNode.parentNode.url.value != '' && e.target.parentNode.parentNode.url.value) {
                submitPost(e.target.parentNode.parentNode, CURRENT_USER);
            } else {
                alert("Please enter a valid URL")
            }
        })

        document.querySelector('.nav-post-btn').addEventListener('click', function() {
            document.querySelector('#new-post').classList.toggle('hidden');
        })

        let home = document.querySelector('.home-logo');
        home.addEventListener('click', function(){
            feed.innerHTML = '';
            fetchAllPosts();
        })

        let profile = document.querySelector('.nav-user');
        profile.addEventListener('click', function(){
            filterPosts(CURRENT_USER.username);
        })

        mybutton = document.getElementById("to-top");
        // When the user scrolls down 20px from the top of the document, show the button
        window.onscroll = function() {scrollFunction()};
        function scrollFunction() {
            if (document.documentElement.scrollTop > 60) {
                mybutton.style.display = "block";
            } else {
                mybutton.style.display = "none";
            }   
        }
        mybutton.addEventListener('click', topFunction)
        function topFunction() {
            // document.body.scrollTop = 0;
            // document.documentElement.scrollTop = 0;
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    })
}

function signIn() {
    var person = prompt("Please enter your name", "Your Name Here");
    if (person != null) {
      CURRENT_USER = person;
      document.querySelector('.nav-user').innerHTML = `<a><i class="fas fa-user"></i> ${person}</a>`
    }
}

function fetchUser(username){
    fetch('http://localhost:3000/users')
    .then(res => res.json())
    .then(data => {
        ALL_USERS = data;
        data.forEach(user => {
        if(user.username == CURRENT_USER){
            CURRENT_USER = user;
            fetchAllPosts();
        }
        })
        if(typeof CURRENT_USER == "string"){
            fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    "Content-Type": "Application/JSON"
                },
                body: JSON.stringify({username: CURRENT_USER})
            })
            .then(res => res.json())
            .then(data => {
                CURRENT_USER = data;
                fetchAllPosts();
            })
        }
    })
    .catch(error => console.error(error))
}

function fetchAllPosts(){
    fetch('http://localhost:3000/posts')
    .then(res => res.json())
    .then(data => {
        let sorted = data.sort(function(a, b) {return a.id - b.id})
        sorted.forEach(post => {
        renderImage(post);
        })
        let comments = document.querySelectorAll('.filter');
        comments.forEach(comment => {
            comment.addEventListener('click', function(event){
                filterPosts(event.target.innerText);
            })
        })
    })
    .catch(error => console.error(error))
}

function renderImage(post){
    let feed = document.querySelector('#feed');
    
    // tile card
    let topDiv = document.createElement('div');
    topDiv.setAttribute('class', 'tile');

    // left side with image and info
    let leftDiv = document.createElement('div');
    leftDiv.setAttribute('class', 'left-div')
    let infoDiv = document.createElement('div');
    infoDiv.setAttribute('class', 'info-div');
    let img = document.createElement('img');
    img.setAttribute('class', 'tile-img')
    img.src = post.src;
    img.setAttribute('onerror',"this.onerror=null;this.src='http://www.oogazone.com/wp-content/uploads/2018/09/top-sandwich-delicious-food-kawaii-cute-cartoon-vector-library.jpg'")
    let report = document.createElement('p');
    report.setAttribute('id',`report-${post.id}`)
    if(!post.is_reported){ //not reported
        report.setAttribute('class', 'report-link');
        report.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Not a sandwich?';
        report.addEventListener('click', function(){
            reportPost(post);
        })
    } else { //i.e. if reported
        report.innerHTML = '<i class="fas fa-frown"></i> This post is under investigation.';
    }
    let user = document.createElement('p');
    let likes = document.createElement('p');
    let i = document.createElement('i');
    let down = document.createElement('i');
    likes.setAttribute('class', 'likes');
    i.setAttribute('class','fas fa-bread-slice');
    down.setAttribute('class','far fa-trash-alt');

    if(CURRENT_USER.liked_posts.includes(post.id)){
        i.setAttribute('style','color:sandybrown;');
        down.setAttribute('style','color:black;');

        likes.append(i, ` ${post.likes} `, down);
        i.addEventListener('click', function(){
            if(i.style.color == 'sandybrown'){
                likes.innerHTML = '';
                i.setAttribute('style','color:black;');
                likes.append(i, ` ${post.likes - 1} `, down);
                handleChange(post, post.likes - 1);
                userLoaf(post, 'down');
            } else if (i.style.color == 'black'){
                likes.innerHTML = '';
                i.setAttribute('style','color:sandybrown;');
                down.setAttribute('style','color:black');
                likes.append(i, ` ${post.likes} `, down);
                handleChange(post, post.likes);
                userLoaf(post, 'up');
            }
        })
    
        down.addEventListener('click', function(){
            if(down.style.color == 'crimson'){
                likes.innerHTML = '';
                down.setAttribute('style','color:black;');
                likes.append(i, ` ${post.likes - 1} `, down);
                handleChange(post, post.likes - 1);
                userTrash(post, 'down');
            } else if (down.style.color == 'black'){
                likes.innerHTML = '';
                down.setAttribute('style','color:crimson;');
                i.setAttribute('style','color:black');
                likes.append(i, ` ${post.likes - 2} `, down);
                handleChange(post, post.likes - 2);
                userTrash(post, 'up');
            }
        })
    } else if(CURRENT_USER.disliked_posts.includes(post.id)){
        i.setAttribute('style','color:black;');
        down.setAttribute('style','color:crimson;');

        likes.append(i, ` ${post.likes} `, down);
        i.addEventListener('click', function(){
            if(i.style.color == 'sandybrown'){
                likes.innerHTML = '';
                i.setAttribute('style','color:black;');
                likes.append(i, ` ${post.likes + 1} `, down);
                handleChange(post, post.likes + 1);
                userLoaf(post, 'down');
            } else if (i.style.color == 'black'){
                likes.innerHTML = '';
                i.setAttribute('style','color:sandybrown;');
                down.setAttribute('style','color:black');
                likes.append(i, ` ${post.likes + 2} `, down);
                handleChange(post, post.likes + 2);
                userLoaf(post, 'up');
            }
        })
    
        down.addEventListener('click', function(){
            if(down.style.color == 'crimson'){
                likes.innerHTML = '';
                down.setAttribute('style','color:black;');
                likes.append(i, ` ${post.likes + 1} `, down);
                handleChange(post, post.likes + 1);
                userTrash(post, 'down');
            } else if (down.style.color == 'black'){
                likes.innerHTML = '';
                down.setAttribute('style','color:crimson;');
                i.setAttribute('style','color:black');
                likes.append(i, ` ${post.likes} `, down);
                handleChange(post, post.likes);
                userTrash(post, 'up');
            }
        })
    } else {
        i.setAttribute('style','color:black;');
        down.setAttribute('style','color:black;');

        likes.append(i, ` ${post.likes} `, down);
        i.addEventListener('click', function(){
            if(i.style.color == 'sandybrown'){
                likes.innerHTML = '';
                i.setAttribute('style','color:black;');
                likes.append(i, ` ${post.likes} `, down);
                handleChange(post, post.likes);
                userLoaf(post, 'down');
            } else if (i.style.color == 'black'){
                likes.innerHTML = '';
                i.setAttribute('style','color:sandybrown;');
                down.setAttribute('style','color:black');
                likes.append(i, ` ${post.likes + 1} `, down);
                handleChange(post, post.likes + 1);
                userLoaf(post, 'up');
            }
        })
    
        down.addEventListener('click', function(){
            if(down.style.color == 'crimson'){
                likes.innerHTML = '';
                down.setAttribute('style','color:black;');
                likes.append(i, ` ${post.likes} `, down);
                handleChange(post, post.likes);
                userTrash(post, 'down');
            } else if (down.style.color == 'black'){
                likes.innerHTML = '';
                down.setAttribute('style','color:crimson;');
                i.setAttribute('style','color:black');
                likes.append(i, ` ${post.likes - 1} `, down);
                handleChange(post, post.likes - 1);
                userTrash(post, 'up');
            }
        })
    }
    
    //right side with caption and comments
    let rightDiv = document.createElement('div');
    rightDiv.setAttribute('class', 'right-div');
    let commentDiv = document.createElement('div');
    commentDiv.setAttribute('class', 'comment-div');
    let commentSection = document.createElement('ul');
    commentSection.setAttribute('id',`comments-${post.id}`)
    commentSection.setAttribute('class', 'comment-list');   
    let caption = document.createElement('li');
    if(post.user == undefined){
        caption.innerHTML = `<i class="fas fa-user-circle"></i> <strong class="filter">${CURRENT_USER.username}</strong><br>${post.caption}`;
    } else {
        caption.innerHTML = `<i class="fas fa-user-circle"></i> <strong class="filter">${post.user.username}</strong><br>${post.caption}`;    
    }
    commentSection.appendChild(caption);
    if(post.comments){
        post.comments.forEach(comment => {
            let li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-user-circle"></i> <strong class="filter">${ALL_USERS[comment.user_id - 1].username}</strong><br>${comment.content}`;
            commentSection.appendChild(li);
        })
    }
    let input = document.createElement('textarea');
    input.setAttribute('type','text');
    input.setAttribute('placeholder', 'Share your thoughts...')
    input.addEventListener('keypress', function(event){
        if(event.key == "Enter" && input.value.trim() != '' ){
            submitComment(input.value, post);
            input.value = "";
        }
    })
    let submitBtn = document.createElement('button');
    submitBtn.setAttribute('class', 'comment-btn');
    submitBtn.innerHTML = '<i class="far fa-comment-dots"></i> Comment';
    submitBtn.addEventListener('click', function(){
        submitComment(input.value, post);
        input.value = "";
    })
    infoDiv.append(report, user, likes);
    commentDiv.append(commentSection);
    rightDiv.append(commentDiv, input, submitBtn);
    leftDiv.append(img,infoDiv)
    topDiv.append(leftDiv, rightDiv);
    feed.prepend(topDiv);
}

function submitComment(comment, post){
    if(comment){
    fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
            "Content-Type": "Application/JSON"
        },
        body: JSON.stringify({
            user: CURRENT_USER,
            post: post,
            content: comment
        })
    })
    .then(res => res.json())
    .then(data => {
        const myNotification = window.createNotification();
        myNotification({
            message: 'Comment successfully saved',
            showDuration: 1500,
            theme: 'success'
        }) 
        let commentSection = document.querySelector(`#comments-${post.id}`)
        let li = document.createElement('li');
        li.innerHTML = data.content;
        li.innerHTML = `<i class="fas fa-user-circle"></i> <strong class="filter">${CURRENT_USER.username}</strong><br>${data.content}`;
        commentSection.appendChild(li);
    })
    .catch(error => console.error(error))
}
}

function handleChange(post, likes){
    fetch(`http://localhost:3000/posts/${post.id}`,{
        method: 'PATCH',
        headers: {
            "Content-Type": "Application/JSON",
            "Accept": "Application/JSON"
        },
        body: JSON.stringify({
            likes: likes
        })
    })
    .catch(error => console.error(error))
}

function submitPost(form, user){
    fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: {
            "Content-Type": "Application/JSON"
        },
        body: JSON.stringify({
            src: form.url.value,
            caption: form.text.value,
            likes: 0,
            user: user
        })
    })
    .then(res => res.json())
    .then(data => {
        const myNotification = window.createNotification();
        myNotification({
            message: 'Post successfully saved',
            showDuration: 1500,
            theme: 'success'
        }) 
        renderImage(data);
        form.url.value = ''
        form.text.value = ''
        document.querySelector('#new-post').classList.toggle('hidden');
    })
    .catch(error => console.error(error))
}

function filterPosts(username){
    feed.innerHTML = '';
    fetch('http://localhost:3000/posts')
    .then(res => res.json())
    .then(data => {
        let sorted = data.sort(function(a, b) {return a.id - b.id})
        sorted.forEach(post => {
        if(post.user.username.trim() == username.trim()){
            renderImage(post);
        }
        })
        let comments = document.querySelectorAll('.filter');
        comments.forEach(comment => {
            comment.addEventListener('click', function(event){
                filterPosts(event.target.innerHTML);
            })
        })
        if(feed.innerHTML == ''){
            feed.innerHTML = `<h1 style="text-align:center"> Sorry, ${username.trim()} doesn't have any posts yet! :'( </h1>`;
        }
    })
    .catch(error => console.error(error))
}

function reportPost(post){
    let feed = document.querySelector('main');
    let modalDiv = document.createElement('div');
    modalDiv.setAttribute('id','myModal');
    modalDiv.setAttribute('class','modal');
    let modalContent = document.createElement('div');
    modalContent.setAttribute('class','modal-content');
    let span = document.createElement('span');
    span.setAttribute('class','close');
    span.innerHTML = '&times;';
    let modalText = document.createElement('p');
    modalText.innerHTML = "It looks like you want to report an image. We'd like to remind you to please <a href='https://www.youtube.com/embed/4Au0K2D3tLA?controls=0&amp;start=45'>keep an open mind</a> and consult the chart below. Any food enveloped in any way can be considered a sandwich. If you would still like to report this post as not a sandwich, after having a philosophical debate with yourself, please provide a reason below as to why you think this is not a sandwich and press 'REPORT'.";
    let img = document.createElement('img');
    img.setAttribute('id','modal-image');
    img.src = 'https://i0.wp.com/flowingdata.com/wp-content/uploads/2017/05/Sandwich-alignment-chart.jpg?resize=720%2C495&ssl=1';
    let confirmBtn = document.createElement('button');
    confirmBtn.setAttribute('id','report-button');
    confirmBtn.innerHTML = 'REPORT';
    modalContent.append(span, modalText, img, confirmBtn);
    modalDiv.append(modalContent);
    feed.append(modalDiv);

    modalDiv.style.display = 'block';

    confirmBtn.addEventListener('click', function(){
        modalDiv.style.display = 'none';  
        fetch(`http://localhost:3000/posts/${post.id}`,{
            method: 'PATCH',
            headers: {
                "Content-Type": "Application/JSON",
                "Accept": "Application/JSON"
            },
            body: JSON.stringify({
                likes: post.likes,
                is_reported: true
            })
        })
        .then(res => res.json())
        .then(data => {
            let report = document.querySelector(`#report-${data.id}`);
            report.innerHTML = '';
            let newLink = document.createElement('p');
            newLink.innerHTML = '<i class="fas fa-frown"></i> This post is under investigation.';
            let infoDiv = report.parentNode;
            infoDiv.removeChild(report);
            infoDiv.prepend(newLink);
        })
        .catch(error => console.error(error))
        handleChange(post, post.likes);
    })

    span.addEventListener('click', function(){
        modalDiv.style.display = 'none';  
    })
    
    window.addEventListener('click', function(){
        if(event.target == modalDiv){
            modalDiv.style.display = 'none';  
        }
    })
}

main()

function userLoaf(post, str){
    if(str == 'up'){ //add post to user liked_posts
        CURRENT_USER.liked_posts.push(post.id);
        for( let i = 0; i < CURRENT_USER.disliked_posts.length; i++){ 
            if ( CURRENT_USER.disliked_posts[i] == post.id) {
              CURRENT_USER.disliked_posts.splice(i, 1); 
            }
         }
        fetch(`http://localhost:3000/users/${CURRENT_USER.id}`,{
            method: 'PATCH',
            headers: {
                "Content-Type": "Application/JSON",
                "Accept": "Application/JSON"
            },
            body: JSON.stringify({
                liked_posts: CURRENT_USER.liked_posts,
                disliked_posts: CURRENT_USER.disliked_posts
            })
        })
        .catch(error => console.error(error))
    } else if (str == 'down'){ //remove post from user liked_posts
        // CURRENT_USER.disliked_posts.push(post.id);
        for( let i = 0; i < CURRENT_USER.liked_posts.length; i++){ 
            if ( CURRENT_USER.liked_posts[i] == post.id) {
              CURRENT_USER.liked_posts.splice(i, 1); 
            }
         }
        fetch(`http://localhost:3000/users/${CURRENT_USER.id}`,{
            method: 'PATCH',
            headers: {
                "Content-Type": "Application/JSON",
                "Accept": "Application/JSON"
            },
            body: JSON.stringify({
                liked_posts: CURRENT_USER.liked_posts,
                disliked_posts: CURRENT_USER.disliked_posts
            })
        })
        .catch(error => console.error(error))
    }
}

function userTrash(post, str){
    if(str == 'up'){ //add post to user disliked_posts
        CURRENT_USER.disliked_posts.push(post.id);
        for( let i = 0; i < CURRENT_USER.liked_posts.length; i++){ 
            if ( CURRENT_USER.liked_posts[i] == post.id) {
              CURRENT_USER.liked_posts.splice(i, 1); 
            }
         }
        fetch(`http://localhost:3000/users/${CURRENT_USER.id}`,{
            method: 'PATCH',
            headers: {
                "Content-Type": "Application/JSON",
                "Accept": "Application/JSON"
            },
            body: JSON.stringify({
                liked_posts: CURRENT_USER.liked_posts,
                disliked_posts: CURRENT_USER.disliked_posts
            })
        })
        .catch(error => console.error(error))
    } else if (str == 'down'){ //remove post from user liked_posts
        // CURRENT_USER.liked_posts.push(post.id);
        for( let i = 0; i < CURRENT_USER.disliked_posts.length; i++){ 
            if ( CURRENT_USER.disliked_posts[i] == post.id) {
              CURRENT_USER.disliked_posts.splice(i, 1); 
            }
         }
        fetch(`http://localhost:3000/users/${CURRENT_USER.id}`,{
            method: 'PATCH',
            headers: {
                "Content-Type": "Application/JSON",
                "Accept": "Application/JSON"
            },
            body: JSON.stringify({
                liked_posts: CURRENT_USER.liked_posts,
                disliked_posts: CURRENT_USER.disliked_posts
            })
        })
        .catch(error => console.error(error))
    }
}