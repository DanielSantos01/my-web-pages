$(function(){
    $('#btn').blur(function(event){
        let screenWidth = window.innerWidth;
        if(screenWidth < 768){
            $('#collapsable-nav').collapse('hide');
        }
    });
});

(function(window) {
    //site object
    let dc = {};

    let currentActive = 'navHomeButton';

    //url do snippet da tela principal
    const homeHTML = 'snippets/home-snippet.html';

    //url do local onde está localizado o JSON das categorias
    const allCategoriesUrl ="https://davids-restaurant.herokuapp.com/categories.json";

    //url do snippet com o título da página
    const categoriesTitleHtml = "snippets/categories-title-snippet.html";

    //url do snippet com o html para inserir as imagens e legendas
    const categoryHtml = "snippets/category-snippet.html";

    const menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";

    const menuItemsTitleHtml = "snippets/menu-items-title.html";

    const menuItemHtml = "snippets/menu-item.html";


    //insere o html recebido dentro do elemento recebido
    let insertHTML = function(selector, html){
        let targetElem = document.querySelector(selector);
        targetElem.innerHTML= html;
    };

    //carrega um gif de loading no elemento passado
    let showLoading = function(selector){
        let html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHTML(selector, html);
    };

    //refatora a string recebida substituindo o valor desejado pelo valor passado
    let insertProperty = function (string, propName, propValue) {
        let propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    }

    //função responsável por fazer a requisição do conteúdo da página principal
    dc.loadHomePage = function(){
        $ajaxUtils.sendGetRequest(homeHTML, function(responseText){
            document.querySelector('#main-content').innerHTML = responseText;
        }, false);

        switchToActive('navHomeButton');
    };

    //mostra a tela de loading e faz a requisição do conteúdo da tela principal assim que o site carrega pela primeira vez
    document.addEventListener('DOMContentLoaded', function(event){
        showLoading('#main-content');
        dc.loadHomePage();
    });


    /*                          DINAMICALLY CATEGORIES                                           */
    //método inicial para carregar o conteúdo das categorias
    dc.loadMenuCategories = function(){
        showLoading("#main-content");
        //requisição pelo JSON
        $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
        switchToActive('navMenuButton');
    };

    //método que diretriza todos os recebimentos de requisições
    function buildAndShowCategoriesHTML (categories) {
        //requisição pelo conteúdo do título
        $ajaxUtils.sendGetRequest(categoriesTitleHtml,function (categoriesTitleHtml) {
            //requisição pelo conteúdo de cada div da categoria
            $ajaxUtils.sendGetRequest(categoryHtml,function (categoryHtml) {
                let categoriesViewHtml =
                buildCategoriesViewHtml(categories,categoriesTitleHtml,categoryHtml);
                insertHTML("#main-content", categoriesViewHtml);
                
            },false);
        },false);
    };
  
    //método que organiza a string que será interpretada como html posteriormente
    function buildCategoriesViewHtml(categories,categoriesTitleHtml,categoryHtml) {
  
        let finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";
    
        //Loop over categories
        for (let i = 0; i < categories.length; i++) {
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            
            html = insertProperty(html, "name", name);
            html = insertProperty(html,"short_name",short_name);

            finalHtml += html;
        }
    
        finalHtml += "</section>";
        return finalHtml;
    }
    /*                          END OF DINAMICALLY CATEGORIES                                   */


    /*                             DINAMICALLY MENU ITEMS                                       */

    //método responsável por iniciar o carregamento do conteúdo da página "single category", de acordo com a caregoria (short_name) passada
    dc.loadMenuItems = function (categoryShort) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
      };

    
    function buildAndShowMenuItemsHTML (categoryMenuItems) {
        // Load title snippet of menu items page
        $ajaxUtils.sendGetRequest(menuItemsTitleHtml,function (menuItemsTitleHtml) {
            // Retrieve single menu item snippet
            $ajaxUtils.sendGetRequest(menuItemHtml,function (menuItemHtml) {
                let menuItemsViewHtml =
                  buildMenuItemsViewHtml(categoryMenuItems,menuItemsTitleHtml,menuItemHtml);

                insertHTML("#main-content", menuItemsViewHtml);
              },
              false);
          },
          false);
    }
      
      
    // Using category and menu items data and snippets html
    // build menu items view HTML to be inserted into page
    function buildMenuItemsViewHtml(categoryMenuItems,menuItemsTitleHtml,menuItemHtml) {
      
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,"name",
                         categoryMenuItems.category.name);

        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,"special_instructions",
                         categoryMenuItems.category.special_instructions);
      
        let finalHtml = menuItemsTitleHtml;

        finalHtml += "<section class='row'>";
      
        // Loop over menu items
        let menuItems = categoryMenuItems.menu_items;

        let catShortName = categoryMenuItems.category.short_name;

        for (let i = 0; i < menuItems.length; i++) {
          // Insert menu item values
          let html = menuItemHtml;

          html = insertProperty(html, "short_name", menuItems[i].short_name);

          html = insertProperty(html, "catShortName", catShortName);

          html = insertItemPrice(html,"price_small",menuItems[i].price_small);

          html = insertItemPortionName(html,"small_portion_name",menuItems[i].small_portion_name);

          html = insertItemPrice(html,"price_large",menuItems[i].price_large);

          html = insertItemPortionName(html,"large_portion_name",menuItems[i].large_portion_name);

          html = insertProperty(html, "name", menuItems[i].name);

          html = insertProperty(html, "description",menuItems[i].description);
      
          // Add clearfix after every second menu item
          if (i % 2 != 0) {
            html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
          }
      
          finalHtml += html;
        }
      
        finalHtml += "</section>";
        return finalHtml;
    }
      
      
    // Appends price with '$' if price exists
    function insertItemPrice(html,pricePropName,priceValue) {
        // If not specified, replace with empty string
        if (!priceValue) {
          return insertProperty(html, pricePropName, "");
        }
      
        priceValue = "$" + priceValue.toFixed(2);
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }
      
      
    // Appends portion name in parens if it exists
    function insertItemPortionName(html,portionPropName,portionValue) {
        // If not specified, return original string
        if (!portionValue) {
          return insertProperty(html, portionPropName, "");
        }
      
        portionValue = "(" + portionValue + ")";
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    }

      /*                           END OF DINAMICALLY MENU ITEMS                                   */
      

    let switchToActive = function(elementToActivate){
        if(elementToActivate != currentActive){
            document.getElementById(currentActive).classList.remove('active');
            document.getElementById(elementToActivate).classList.add('active');
            currentActive = elementToActivate;
        }
    };
  
    window.$dc = dc;

})(window);