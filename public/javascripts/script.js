$("#return-oneway").click(() => {
  console.log("Clicked"); 
  let value = $("#label").text(); 
  console.log(value); 
  if(value === "Return") {
    $("#label").text("One-Way");
  } else {
    $("#label").text("Return");
  }
  $("#return").toggle();
});


//Form Basket 
$('#myForm').submit(function(e){
  e.preventDefault();
  $.ajax({
      url: '/add',
      type: 'post',
      data:$('#myForm').serialize(),
      success:function(){
          console.log((data));
      }
  });
});


