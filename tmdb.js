"use strict;"
// this is my global variable, which is my api key to tmdb
// the api key is used to create
var api_key = "c59af6089ebbf319b331bfeefaca6cc1"

document.addEventListener("DOMContentLoaded", event =>{
    // setting some inputs, buttons, tables as variables so we can use later in the script
    let submit = document.getElementById("submit");
    let total_results = document.getElementById("total_results")
    let table = document.getElementById("table_body");
    var errors = document.getElementById("error_messages");
    submit.addEventListener("click",even =>{
        //checking if the api key is present
        //let api_key = document.getElementById("api_key").value;
        // let api_key = "c59af6089ebbf319b331bfeefaca6cc1"
        if(!api_key){
            //if no api key is found, then an alert will pop up as an error message
            alert("no api key found!");
        }
        else{
            var movie = document.getElementById("inputId").value;
            //checking if there is a movie name and not an empty string
            if(movie){
                // if no empty string is found, then this will fire
                // i need to be able to parse failed requests so this can go a lot more smoothly
                while(table.firstChild){
                    table.removeChild(table.firstChild);
                }
                fetch(`https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${movie}&language=en-US&page=1&include_adult=false`).then(
                    x => x.json()
                ).then(x=>{
                    total_results.innerText = x.total_results;
                    parse_data(x);
                    errors.innerText = "";

                });

                function parse_data(data){
                    //parse the data to determine if its a success or not
                    if(data.success == false)
                    {
                        errors.innerText = data.status_message;
                    }
                    else{
                        response_successful(data);
                    };

                }
                function response_successful(data){
                    //parse data if it was successful
                    if(data.total_results !=0){
                        console.log("Data");
                        console.log(data);
                        console.log("End Data");
                        data.results.forEach(x=>{
                            var table_row = document.createElement("tr");
                            if(x.poster_path != null){
                                getTrailer(x.id).then(trailer=>{
                                    console.log("posters that are not empty");
                                    console.log(x);
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
                    }
                    else{                        
                        alert("No Items found!");
                    }
                }
                function getTrailer(movie_id){
                    return new Promise((resolve, reject) => { 
                        fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${api_key}&language=en-US&append_to_response=videos`)
                    .then(
                        response => response.json()
                    ).then(response =>{
                        // console.log(response);
                        try{
                            if(response.videos.results.length != 0){
                                movie_url = `https://www.youtube.com/watch?v=${response.videos.results[0]['key']}`
                                return resolve(movie_url);
                            }
                            return resolve("");
                        }catch(error){
                            console.log(response.videos)
                            console.log(error);
                            return "";
                            // return reject('Fucked up');
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
                        case "ko":
                            return "🇰🇵";
                        case "cn":
                            return "🇨🇳";
                    }
                }


            }
        }
    });
});
