var TempArr=[];//存储option  
  
$(function(){  
    /*先将数据存入数组*/  
    var values = new Array();
    $("#typenum option").each(function(index, el) { 
        values.push($(this).text()); 
 /*       TempArr[index] = $(this).text();  */
    });
    values = values.sort();
    for(var i = 0; i < values.length; i++) {
        TempArr[i] = values[i];
    }

    $(document).bind('click', function(e) {    
        var e = e || window.event; //浏览器兼容性     
        var elem = e.target || e.srcElement;    
        while (elem) { //循环判断至跟节点，防止点击的是div子元素     
            if (elem.id && (elem.id == 'typenum' || elem.id == "makeupCo")) {    
                return;    
            }    
            elem = elem.parentNode;    
        }    
        $('#typenum').css('display', 'none'); //点击的不是div或其子元素     
    });    
})  

/* 选择的内容放入到input里面去*/  
function changeF(this_) {  
    /*$(this_).prev("input").val($(this_).find("option:selected").text()); */
     $("#makeupCo").val($(this_).find("option:selected").text());
    $("#typenum").css({"display":"none"});  
}

/* 点击input，select内容显示出来*/  
function setfocus(this_){  
    $("#typenum").css({"display":""});  
    var select = $("#typenum");  
    select.html("");
    for(i=0;i<TempArr.length;i++){  
        var option = $("<option></option>").text(TempArr[i]);  
        select.append(option);  
    }
       
}  
  
function setinput(this_){  
    var select = $("#typenum");  
    select.html("");  
    for(i=0;i<TempArr.length;i++){  
        //若找到以txt的内容开头的，添option  
        if(TempArr[i].substring(0,this_.value.length).indexOf(this_.value)==0){  
            var option = $("<option></option>").text(TempArr[i]);  
            select.append(option);  
        }  
    }  
}  