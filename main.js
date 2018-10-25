"use strict;"
// this is my global variable, which is my api key to tmdb
// the api key is used to create
var api_key = "c59af6089ebbf319b331bfeefaca6cc1"
// global results, to see if the promise is already loaded
// if loaded then we will not call fetch to get the data, and we will just
// process the current promise in memory
var results = "";

document.addEventListener("DOMContentLoaded",()=>{
    // variable for the div that will be shown/hidden
    var trending = document.getElementById("show_trending");
    // variable for button, that will be fired
    var trending_button = document.getElementById("trending");
    // setting the style to none, when the page is loaded
    trending.style.display = "none";

    let table = document.getElementById("trending_table_body");

    trending_button.addEventListener("click", event =>{
        display_trending();
    })

    function display_trending(){
        // if result is empty, then we will get a new promise,
        // this promise will be seen from the console window
        if(results == ""){
            console.log("calling the api for the first time and displaying results");
            results = getTrendingPromise();
        }
        if(trending.style.display == "none"){
            // displaying the block if the block is set to none, default is none
            // so when the button is fired, it will display, and be hidden when clicked again
            getTrending();
            trending.style.display = "block";
        }
        else{
            trending.style.display = "none";
        }

    }
    
    function getTrendingPromise(){
        console.log("calling fetch");
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&append_to_response=videos`)
    }
    
    function getTrending(){
        results.then(response => response.json()).then(response =>{
            response.results.forEach(x => {
                var table_row = document.createElement("tr");
                if(x.poster_path != null){
                    getTrailer(x.id).then(trailer=>{
                        table_row.innerHTML =`
                        <td class=poster_image><a
                         target=_blank 
                         href=https://image.tmdb.org/t/p/w600_and_h900_bestv2${x.poster_path}>
                         <img class=images width=40px src=https://image.tmdb.org/t/p/w600_and_h900_bestv2${x.poster_path}></a></td>
                        <td class=overview_text title="${x.overview}" > <a class=name_url href="${trailer}" target=_blank> ${x.title}</a></td> 
                        <td class=overview_text>${getEmojiFlag(x.original_language)}</td>
                        <td class=overview_text>${x.release_date}</td>
                        
                        `;
                        table.appendChild(table_row);

                    });
                }
                else{
                    getTrailer(x.id).then(trailer=>{
                        table_row.innerHTML =`
                        <td>No img</td>
                        <td class=overview_text title="${x.overview}" > <a href="${trailer}" target=_blank> ${x.title}</a></td> 
                        <td class=overview_text>${x.original_language}</td>
                        <td class=overview_text>${x.release_date}</td>
                        
                        `;
                        table.appendChild(table_row);

                    });
                }
                // table.appendChild(table_row);

            });
        })
    }

    async function getTrailer(movie_id){
        return new Promise((resolve, reject) => { 
            fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${api_key}&language=en-US&append_to_response=videos`)
        .then(
            response => response.json()
        ).then(response =>{
            // console.log(response);
            try{
                if(response.videos.results[0]['key']){
                    movie_url = `https://www.youtube.com/watch?v=${response.videos.results[0]['key']}`
                    return resolve(movie_url);
                }
            }catch(error){
                return reject('Fucked up');
            }

        })
        });
        //return await response;
    }

    function getEmojiFlag(language){
        console.log(language);
        switch(language){
            case "en":
                return "🇺🇸";
            case "zh":
                return "🇨🇳";
            case "fr":
                return "🇫🇷";
            case "da":
                return "🇩🇪";
            case "tl":
                return "🇵🇭";
            case "ja":
                return "🇯🇵";
        }
    }
})

