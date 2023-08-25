const express =require('express');
const cheerio =require('cheerio');
const axios =require('axios');
const cors =require('cors');
const request =require('request');
const PORT =3000 | process.env.PORT ;
const app =express() ;
app.use(express.json());
app.listen(PORT , ()=>{
    console.log(`server is running on Port ${PORT}`);
});
const articles =[{
    name:String ,
    Url:String
}];

const sportreports=[{
name:"telegraph",
url:'https://www.telegraph.co.uk/sport' 
}
,{
name:"skysports", 
url:'https://www.skysports.com/football/news'
},
{
name:"BBC" ,
url:"https://www.bbc.com/sport"


}
]

sportreports.map((reports)=>{

    request(reports.url ,(error ,respone ,html)=>{

if(!error){
const $=cheerio.load(html);
if(reports.name =="telegraph"){

  $('.list-headline__link.u-clickable-area__link').each((i ,el)=>{
    const item=$(el).text().replace(/\s\s+/g ,"");
    const link =$(el).attr('href');
articles.push({
name:item ,
Url:link.includes("https://www.telegraph.co.uk") ? link :"https://www.telegraph.co.uk"+link

})

 
  });
 

}else if(reports.name="skysports"){
    $('.news-list__headline').each((i ,el)=>{

const item =$(el).text().replace(/\s\s+/g,"");
const link=$(el).children('a').attr('href');
articles.push({
    name:item ,
    Url:link
})

    })
}}
    });

});


app.get('/' ,(req, res)=>{
    res.json("Hello");
})
app.get('/news', (req,res)=>{
    res.json(articles)
});
app.get('/news/:newspaperId' ,(req ,res)=>{

   try{  const newsPaperId =req.params.newspaperId;

    const newsPaperAddress=sportreports.filter(sportreport =>sportreport.name == newsPaperId)[0].url 
    
    axios.get(newsPaperAddress).then((response) => {
        
    const html = response.data ;
    const $ =cheerio.load(html);
    const specificArticle =[{
        name:String ,
        Url:String
    }]
    let st='';
    if(newsPaperId == "telegraph" ){
        st='.list-headline__link.u-clickable-area__link'
        $(st).each((i ,el)=>{
            $('.list-headline__link.u-clickable-area__link').each((i ,el)=>{
                const item=$(el).text().replace(/\s\s+/g ,"");
                const link =$(el).attr('href');
                
                specificArticle.push({
                    name:item ,
                    Url:link.includes("https://www.telegraph.co.uk") ? link :"https://www.telegraph.co.uk"+link
                })
        
        
            })

    })

    res.json(specificArticle)

    }
    if(newsPaperId=="skysports"){
        st='.news-list__headline';
        $(st).each((i ,el)=>{

            const item =$(el).text().replace(/\s\s+/g,"");
            const link=$(el).children('a').attr('href');
            specificArticle.push({
                name:item ,
                Url:link
            })
            
                })
             
                res.json(specificArticle)

    }




    }).catch((err) => {
        console.error("There is an error " +err);
    });


   }catch(error){
    res.status(404).json({message :"Try passing a correct parameter" , example: "news/skysports or news/telegraph or /news to get all the news from different sources"})
   }

   



})
