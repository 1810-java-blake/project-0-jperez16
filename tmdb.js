// single javascript file that handles all of the processing for buttons, events,etc
// my api key is included, please no hax
// Authors Notes:
// while some of the logic that i wrote is fine, i need to find a way to prevent limits when polling
// the movide database api, since they do have rate limiting, this is an issue for me when displaying multiple items.

document.addEventListener("DOMContentLoaded", event=>{
    //setting the api key that i will be using to contact the movie database server
    let api_key = "c59af6089ebbf319b331bfeefaca6cc1";

    // setting the variables for the buttons that the pages will be using
    let movies_button = document.getElementById("movies_button");
    let movies_trending_button = document.getElementById("movies_trending_button");
    let shows_trending_button = document.getElementById("shows_trending_button");
    let shows_button = document.getElementById("shows_button");
    
    // these are the divs on the index.html page
    // i will be manipulating them with javascript
    let movies_trending = document.getElementById("movies_trending");
    let shows_trending = document.getElementById("shows_trending");

    // checking if show_trending box is available to the javascript file
    // if it is, then it will set the display style to none for trending
    if(movies_trending){
        movies_trending.style.display = "none";
    }
    if(shows_trending){
        shows_trending.style.display = "none";
    }

    // setting the variables for the errors and total result
    let total_results = document.getElementById("total_results")
    var errors = document.getElementById("error_messages");

    // this function is checking if the movie button is not null
    if(movies_button){
        movies_button.addEventListener("click",event=>{
            
            var movie = document.getElementById("inputId").value;
            let table = document.getElementById("table_body");
            let tmdb = new TMDB(api_key, "movie", table);
            if(movie){
                while(table.firstChild){
                    table.removeChild(table.firstChild);
                }
                tmdb.getMovies(movie,total_results,errors);
            }
        });
    }

    // this function is checking if the trending button is not null
    if(movies_trending_button){
        movies_trending_button.addEventListener("click", event=>{            
            let table = document.getElementById("movies_trending_table_body");
            let tmdb = new TMDB(api_key, "movie", table, movies_trending);
            while(table.firstChild){
                table.removeChild(table.firstChild);
            }
            tmdb.trendingMovies();
        });
    }

    // this function is checking if the trending button is not null
    if(shows_trending_button){
        shows_trending_button.addEventListener("click", event=>{
            let table = document.getElementById("shows_trending_table_body");
            let tmdb = new TMDB(api_key, "tv", table, shows_trending);
            while(table.firstChild){
                table.removeChild(table.firstChild);
            }
            tmdb.trendingShows();
        });
    }
    
    // this function is checking if the shows button is not null
    if(shows_button){
        shows_button.addEventListener("click", event=>{

            let table = document.getElementById("table_body");
            var show = document.getElementById("inputId").value;
            while(table.firstChild){
                table.removeChild(table.firstChild);
            }
            let tmdb = new TMDB(api_key, "tv", table);
            tmdb.getShow(show,total_results);

        });

    }


});


// i decided to create a class that way I can create multiple objects
// this will prevent any collusion from any of the buttons when pressed
// the results are based on the object instance and not the page
class TMDB{
    // constructor, that the instance will be using
    constructor(api_key, contentType, table, trending){
        // api key to be consumed
        this.api_key = api_key;
        // trending and table are used to displayed the data to the page, it does not matter what table is passed

        this.table = table
        this.trending = trending;
        
        //global results to pass around the data globaly instead by prameter
        this.results = "";
        this.contentType = contentType;
    };

    getShow(name, resultLabel){
        // this fetch will get the name of the shows, with their id
        // that we need to consume and process to get an external ID
        let response = fetch(`https://api.themoviedb.org/3/search/tv?api_key=${this.api_key}&language=en-US&query=${name}&page=1`);
        // processing the promise
        this.getShowProcessor(response, resultLabel);
    }

    getShowProcessor(response, resultLabel){
        response.then(
            response => response.json()
        ).then(response=>{
            resultLabel.innerText = response.total_results;
            response.results.forEach(data_elements=>{
                this.getIMDB(data_elements.id).then(imdb => imdb.json()).then(
                    imdb =>{
                        var table_row = document.createElement("tr");
                        if(data_elements.poster_path != null){
                            table_row.innerHTML =`
                            <td class=poster_image><a
                             target=_blank 
                             href=https://image.tmdb.org/t/p/w600_and_h900_bestv2${data_elements.poster_path}>
                             <img class=images src=https://image.tmdb.org/t/p/w600_and_h900_bestv2${data_elements.poster_path}></a>
                             </td>
                            <td class=overview_text title="${data_elements.overview}">
                            <a class=name_url href="https://www.imdb.com/title/${imdb.imdb_id}" target=_blank> 
                            ${data_elements.original_name}</a>
                            </td> 
                            <td class=overview_text>
                            ${this.getEmojiFlag(data_elements.original_language)}
                            </td>
                            <td class=overview_text>
                            ${data_elements.first_air_date}
                            </td>
                            
                            `;
                            this.table.appendChild(table_row);
                        }
                        else{
                            table_row.innerHTML =`
                            <td class=overview_text>No Img</td>
                            <td class=overview_text title="${data_elements.overview}">
                            <a class=name_url href="https://www.imdb.com/title/${imdb.imdb_id}" target=_blank> 
                            ${data_elements.original_name}</a>
                            </td> 
                            <td class=overview_text>
                            ${this.getEmojiFlag(data_elements.original_language)}
                            </td>
                            <td class=overview_text>
                            ${data_elements.first_air_date}
                            </td>
                            
                            `;
                            this.table.appendChild(table_row);
                        }
                    });
            });

        })


    }

    getIMDB(id){
        return fetch(`https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${this.api_key}&language=en-US`)
    }

    trendingMovies(){
        this.results = this.getTrendingMoviesPromise();
        if(this.trending.style.display == "none"){
            this.getTrending();
            this.trending.style.display = "block";
        }
        else{
            this.trending.style.display = "none";
        }
    }
    trendingShows(){
        this.results = this.getTrendingShowsPromise();
        if(this.trending.style.display == "none"){
            this.getTrending();
            this.trending.style.display = "block";
        }
        else{
            this.trending.style.display = "none";
        }

    }


    getTrendingMoviesPromise(){
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${this.api_key}&append_to_response=videos`)
    }
    getTrendingShowsPromise(){
        return fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${this.api_key}`)
    }

    getTrending(){
        console.log(`Displaying results for: ${this.contentType}`);
        this.results.then(response => response.json()).then(response=>{
            response.results.forEach(x=>{
                console.log(x);
                var table_row = document.createElement("tr");
                if(x.poster_path != null){
                    this.getTrailer(x.id).then(trailer=>{
                        if (x.title){
                            var name = x.title
                            var release = x.release_date
                        }
                        else{
                            var name = x.name;
                            var release = x.first_air_date
                        }
                        table_row.innerHTML =`
                        <td class=poster_image><a
                         target=_blank 
                         href=https://image.tmdb.org/t/p/w600_and_h900_bestv2${x.poster_path}>
                         <img class=images width=40px src=https://image.tmdb.org/t/p/w600_and_h900_bestv2${x.poster_path}></a></td>
                        <td class=overview_text title="${x.overview}" >
                         <a class=name_url href="${trailer}" target=_blank> ${name}</a></td> 
                        <td class=overview_text>${this.getEmojiFlag(x.original_language)}</td>
                        <td class=overview_text>${release}</td>
                        
                        `;
                        this.table.appendChild(table_row);

                    });
                }
            })
        })
    }

    getMovies(name, resultTable, errorLabel){
        this.url = `https://api.themoviedb.org/3/search/movie?api_key=${this.api_key}&query=${name}&language=en-US&page=1&include_adult=false`
        fetch(this.url).then(response => response.json()).then(response =>{
            resultTable.innerText = response.total_results;
            errorLabel.innerText = "";
            this.parseData(response,errorLabel);

        })

    };
    getTrailer(id){
        // while this logic is sound,  i need to find a way to rate limit
        // when i call the tmdb api, to prevent issues causing with rates
        return  new  Promise((resolve, reject) => { 
            fetch(`https://api.themoviedb.org/3/${this.contentType}/${id}?api_key=${this.api_key}&language=en-US&append_to_response=videos`)
        .then(
            response => response.json()
        ).then(response =>{
            try{
                if(response.videos.results.length != 0){
                    this.movie_url = `https://www.youtube.com/watch?v=${response.videos.results[0]['key']}`
                    return resolve(this.movie_url);
                }
                return resolve("");
            }catch(error){
                return reject("Unable to process the request");
            }

        })
        }).catch(error=> console.log());
    };

    parseData(data, errorLabel){
        if(data.success == false){
            errorLabel.innerText = data.status_message;
        }else{
            this.reponse_success(data);
        }
    }
    
    reponse_success(data){
        if(data.total_results !=0){
            data.results.forEach(data_elements => {
                var table_row = document.createElement("tr");
                if(data_elements.poster_path != null){
                    this.getTrailer(data_elements.id).then(trailer=>{
                        table_row.innerHTML =`
                        <td class=poster_image><a
                         target=_blank 
                         href=https://image.tmdb.org/t/p/w600_and_h900_bestv2${data_elements.poster_path}>
                         <img class=images width=40px src=https://image.tmdb.org/t/p/w600_and_h900_bestv2${data_elements.poster_path}></a>
                         </td>
                        <td class=overview_text title="${data_elements.overview}">
                        <a class=name_url href="${trailer}" target=_blank> 
                        ${data_elements.title}</a>
                        </td> 
                        <td class=overview_text>
                        ${this.getEmojiFlag(data_elements.original_language)}
                        </td>
                        <td class=overview_text>
                        ${data_elements.release_date}
                        </td>
                        
                        `;
                        this.table.appendChild(table_row);
                    })
                }
                
            });

        }
    }

    getEmojiFlag(language){
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
            case "ko":
                return "🇰🇵";
            case "cn":
                return "🇨🇳";
            case "sv":
                return "🇸🇪";
            case "ar":
                return "🇦🇷";
            case "de":
                return "🇩🇪";
        }
    }

}