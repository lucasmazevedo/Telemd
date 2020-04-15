# Covid19stats.js

![](https://axelhardy.com/dev/codecanyon/covid19stats/img/capt.png)

**[Covid19Stats.JS](https://axelhardy.com/dev/codecanyon/covid19stats/demo/)** is an easy-to-use jQuery plugin to generate **a beautiful widget** on your website. It shows the latest updated stats of the Coronavirus (Covid-19) based on [coronavirus-tracker-api](https://github.com/ExpDev07/coronavirus-tracker-api).  
  
It is **fully responsive**, made with the latest CSS standards (Flexbox) and easy to implement with just one call to the jQuery plugin.  
  
You can get the last worldwide stats but you can also target a specific country by passing a simple parameter to the plugin.  
  
Check Covid19Stats.JS in action [on the demo website](https://axelhardy.com/dev/codecanyon/covid19stats/demo/).

## How to Install?

1.  Paste this line along with your other CSS files between  `<head>`  and  `</head>`  :  
      
    `<link  rel="stylesheet"  href="css/covid19stats.css">`  
      
2.  Covid19stats.js requires jQuery to work. If you don't already use it on your website, place this line of code just above the  `</body>`  tag :  
      
    `<script  src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>`  
      
    
3.  Paste this line below your jQuery script :  
      
    `<script  src="js/covid19stats.js"  type="text/javascript"></script>`

## Basic Covid19stats.js Configuration

Now that everything is set up, let's try to implement the most basic Covid19stats.js configuration in your website. Just paste this code after the Javascript files you imported in step 2, so just above the  `</body>`  tag :  
  

```html
<script>
$.covid19stats({
    element: "#covid1"
});
</script>
```

And add the corresponding HTML div where you want the widget to appear :

```html
<div id="#covid1"></div>
```

With this configuration, you should see the widget appearing with the worldwide stats.

## Covid19stats.js Options

```js
$.covid19stats({
	element: "#your_element_id", // Target element ID
	countryCode: "FR", // ISO Country Code (get the list here : https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
	showImg: true, // True or false to show the left covid image
	showCases: true, // True or false to show the "cases" stat
	showDeaths: true, // True or false to show the "deaths" stat
	showRecovered: true, // True or false to show the "recovered" stat
	showRightLabel: true // True or false to show the "right label"
});
```

## License

You are free to use this jQuery plugin - please just link to this repo somewhere in your project :)
