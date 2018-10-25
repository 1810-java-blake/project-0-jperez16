//sorry i don't know how to properly comment, so i derp alot in my comments


//single javascript file that handles all of the processing for buttons, events,etc
// my api key is included, please no hax

document.addEventListener("DOMContentLoaded", event=>{
    //setting the api key that i will be using to contact the movie database server
    let api_key = "c59af6089ebbf319b331bfeefaca6cc1";

    // setting the variables for the buttons that the pages will be using
    let movies_button = document.getElementById("movies_button");
    let trending_button = document.getElementById("trending_button");
    let shows_button = document.getElementById("shows_button");
    let trending = document.getElementById("show_trending");
    
    // checking if show_trending box is available to the javascript file
    // if it is, then it will set the display style to none for trending
    if(trending){
        trending.style.display = "none";
    }

    // setting the variables for the errors and total result
    let total_results = document.getElementById("total_results")
    var errors = document.getElementById("error_messages");

    // this function is checking if the movie button is not null
    if(movies_button){
        movies_button.addEventListener("click",event=>{
            
            var movie = document.getElementById("inputId").value;
            let table = document.getElementById("table_body");
            let tmdb = new TMDB(api_key, table);
            if(movie){
                while(table.firstChild){
                    table.removeChild(table.firstChild);
                }
                tmdb.getMovies(movie,total_results,errors);
            }
        });
    }

    // this function is checking if the trending button is not null
    if(trending_button){
        trending_button.addEventListener("click", event=>{
            //let trending_table_body = document.getElementById("trending_table_body");
            let table = document.getElementById("trending_table_body");
            let tmdb = new TMDB(api_key, table, trending);
            while(table.firstChild){
                table.removeChild(table.firstChild);
            }
            tmdb.trendingContent();
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
            let tmdb = new TMDB(api_key, table);
            tmdb.getShow(show,total_results);

        });

    }


});



class TMDB{
    constructor(api_key, table, trending, ){
        this.api_key = api_key;
        this.table = table
        this.trending = trending;
        this.results = "";
    };

    getShow(name, resultLabel){
        // this fetch will get the name of the shows, with their id
        // that we need to consume and process to get an external ID
        let response = fetch(`https://api.themoviedb.org/3/search/tv?api_key=${this.api_key}&language=en-US&query=${name}&page=1`);
        this.getShowProcessor(response, resultLabel);
    }
    getShowProcessor(response, resultLabel){
        response.then(
            response => response.json()
        ).then(response=>{
            console.log(response);
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

    trendingContent(){
        this.results = this.getTrendingPromise();
        if(this.trending.style.display == "none"){
            this.getTrending();
            this.trending.style.display = "block";
        }
        else{
            this.trending.style.display = "none";
        }
        

    }
    getTrendingPromise(){
        return fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${this.api_key}&append_to_response=videos`)
    }
    getTrending(){
        this.results.then(response => response.json()).then(response=>{
            response.results.forEach(x=>{
                console.log(response);
                var table_row = document.createElement("tr");
                if(x.poster_path != null){
                    this.getTrailer(x.id).then(trailer=>{
                        table_row.innerHTML =`
                        <td class=poster_image><a
                         target=_blank 
                         href=https://image.tmdb.org/t/p/w600_and_h900_bestv2${x.poster_path}>
                         <img class=images width=40px src=https://image.tmdb.org/t/p/w600_and_h900_bestv2${x.poster_path}></a></td>
                        <td class=overview_text title="${x.overview}" > <a class=name_url href="${trailer}" target=_blank> ${x.title}</a></td> 
                        <td class=overview_text>${this.getEmojiFlag(x.original_language)}</td>
                        <td class=overview_text>${x.release_date}</td>
                        
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
        return new Promise((resolve, reject) => { 
            fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${this.api_key}&language=en-US&append_to_response=videos`)
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
        });
    };

    parseData(data, errorLabel){
        if(data.success == false){
            errorLabel.innerText = data.status_message;
        }else{
            this.reponse_success(data);
        }
    }
    
    reponse_success(data){
        console.log(data);
        if(data.total_results !=0){
            data.results.forEach(data_elements => {
                console.log(data_elements);
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