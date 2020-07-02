//IIFE
(function(global){

    //cria um objeto vazio
    let ajaxUtils = {};

    function getRequestObject(){ //retorna (ou não) um request object baseado no navegador do usuário
        if(window.XMLHttpRequest){
            //a maioria dos navegadores se encaixa nesse padrão
            return(new XMLHttpRequest());
        }else if(window.ActiveXObject){
            //para navegadores muito velhos (opcional)
            return(new ActiveXObject('Microsoft.XMLHTTP'));
        }else{
            //caso o navegador não suporte o AJAX
            global.alert('AJAX is not supported!');
            return(null);
        }
    };


    ajaxUtils.sendGetRequest = function(requestURL, responseHandler, isJson){ //função a ser chamada quando ocorrer um evento (um request) - recebe uma url e a função a ser executada como resposta

        let request = getRequestObject(); //instancia um novo request object
        request.onreadystatechange = function(){ //passa o endereço da função para que ela seja executada quando o estado mudar(basicamente diz o que acontece quando receber a resposta do servidor)
            handleResponse(request, responseHandler, isJson); //função que realmente será executada/chamada
        };

        request.open('GET', requestURL, true); //finalmente faz o request
        request.send(null); //não envia nada do corpo do html
    };

    function handleResponse(request, responseHandler, isJson){ //fnção realmente executada quando o request for aceito
        if(request.readyState == 4 && request.status == 200){ //verifica o status da requisição
            if(isJson == undefined){
                isJson = true;
            }

            if(isJson){
                responseHandler(JSON.parse(request.responseText));
            }else{
                responseHandler(request.responseText);
            }
        }
    };

    window.$ajaxUtils = ajaxUtils;

})(window);