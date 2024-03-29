import React from 'react';
import $ from 'jquery';
import ShoppingCart from './ShoppingCart.js';
class ProductCatalog extends React.Component{
    constructor(props)
    {
        super(props);
        this.state = {
            image : [],
            name : [],
            price : [],
            code : [],
            quantity : [],
            dataLoaded : false,
            url : 'http://localhost/shopping-cart/index.php',
            cart : []
        };
        this.settingUpEventListeners = this.settingUpEventListeners.bind(this);
    }
    settingUpEventListeners()
    {
        let _this = this;
        $('#emptyCartBtn').on('click', function(){
            _this.setState(()=>({
                cart : []
            }))
        });
        $('#checkoutbtn').on('click', function(){
            if (_this.state.cart.length !== 0)
            {
                var code = [];
                var buyingQuantity = [];
                for (let index in _this.state.cart)
                {
                    let array = _this.state.cart;
                    // console.log(array[index]);
                    code.push(array[index]['code']);
                    buyingQuantity.push(array[index]['quantity']);
                }
                $.post({
                    url : _this.state.url,
                    data : {
                        'req' : 'checkout',
                        'code' : code,
                        'quantity' : buyingQuantity
                    },
                    success : function(response)
                    {
                        console.log(response);
                        if (response !== '[]')
                        {
                            _this.setState(()=>({
                                image : [],
                                name : [],
                                price : [],
                                code : [],
                                quantity : [],
                                dataLoaded : false,
                                url : 'http://localhost/shopping-cart/index.php',
                                cart : []
                            }));
                            response = JSON.parse(response);
                            for(var key in response)
                            {
                                let object = response[key];
                                for(var key1 in object)     
                                {
                                    var newVal = _this.state[key1];
                                    newVal.push(object[key1]);
                                    _this.setState(()=>({
                                        key1 : newVal
                                    }));
                                }
                            }
                            _this.setState(()=>({
                                dataLoaded : true
                            }));
                        }
                    },
                    complete : function()
                    {
                        $('#emptyCartBtn').trigger('click');
                        _this.settingUpEventListeners();
                    }
                })
            }
            else
            {
                alert("Vui lòng chọn mua sản phẩm để thanh toán.");
            }
        })
        $('.buybtn').on('click', function(){
            let id = $(this).attr('code');
            let val = $('#'+ id).val() === '' ? '0' : $('#'+ id).val();
            $('#'+ id).text("");
            $.post({            //perform POST to update the product's quantity.
                url : _this.state.url,
                data : {
                    [id] : val,
                    'req' : 'update'
                },
                success : function(result)        //response is an array of only one object
                {
                    if (result !== '[]')
                    {
                        let response = JSON.parse(result);
                        //check for previous product in state here
                        response = response[0];     //get the object inside the array
                        let index = _this.state.code.indexOf(response['code']);
                        let remain = _this.state.quantity[index];
                        if (_this.state.cart.length === 0)
                        {
                            if (parseInt(response['quantity']) <= remain)
                            {
                                let carT = [response];
                                _this.setState(()=>({
                                    cart : carT
                                }));
                            }
                            else
                            {
                                alert("Chỉ còn lại " + remain + " sản phẩm. Vui lòng nhập lại.");
                            }
                        }
                        else
                        {
                            let newCart = [];
                            let updated = true;     //if the quantity should be updated
                            let exist = false;      //if the buying product is already in cart
                            _this.state.cart.forEach(function(element, index){
                                if (response['code'] === element['code'])
                                {
                                    var buyQuan = parseInt(response['quantity']);
                                    let cartQuan = parseInt(element['quantity']);
                                    buyQuan = buyQuan + cartQuan;
                                    if (buyQuan <= remain)
                                    {
                                        element['quantity'] = buyQuan.toString();
                                    }
                                    else
                                    {
                                        alert("Chỉ còn lại " + remain + " sản phẩm. Vui lòng nhập lại.");
                                        updated = false;
                                    }
                                    exist = true;
                                }
                                if (buyQuan !== 0)
                                {
                                    newCart.push(element);
                                }
                            })
                            if (!exist)
                            {
                                if (parseInt(response['quantity']) <= remain)
                                {
                                    newCart.push(response);
                                }
                                else
                                {
                                    alert("Chỉ còn lại " + remain + " sản phẩm. Vui lòng nhập lại.");
                                }
                            }
                            if (updated)
                            {   
                                _this.setState(()=>({
                                    cart : newCart
                                }))
                            }

                        }
                    }
                    
                }
            })
        });
    }
    componentDidMount()
    {
        let _this = this;
        $.get(
            {
                url : _this.state.url,
                data : {
                    'req' : 'init'
                },
                success : function(response)
                {
                    console.log(response);
                    if (response !== '[]')
                    {
                        response = JSON.parse(response);
                        for(var key in response)
                        {
                            let object = response[key];
                            for(var key1 in object)     
                            {
                                var newVal = _this.state[key1];
                                newVal.push(object[key1]);
                                _this.setState(()=>({
                                    key1 : newVal
                                }));
                            }
                        }
                        _this.setState(()=>({
                            dataLoaded : true
                        }));
                    }

                },
                complete : function()       //add an event handler for rendered buttons.
                {
                    _this.settingUpEventListeners();
                }
            }
        );
    };
    render()
    {
        let returned = [];
        if (this.state.dataLoaded)
        {
            let _this = this;
            this.state.image.forEach(function(element, index) {
                let imgPath = require("./product-images/" + element + ".jpg");
                returned.push(
                    <div className = 'container' key = {index}>
                        <img src = {imgPath} alt = {element} width = "auto" height = "200px"></img>
                        <p>{_this.state.name[index]}</p>
                        <p>{_this.state.price[index]}USD</p>
                        {_this.state.quantity[index] !== 0?
                        <>
                        <input type = "number" className = 'quantity' id = {_this.state.code[index]} name = {_this.state.code[index]} image = {element} price = {_this.state.price[index]} ></input>
                        <button type = 'button' className = 'buybtn' code = {_this.state.code[index]}>Buy</button>
                        </>
                        : <p><b>Hết hàng</b></p>
                        }
                    </div>
                );
            
            });
        }
        return(
            <form method = 'POST' action = {this.state.url}>
                <title>Giỏ hàng siêu đơn giản</title>
                <h1>
                    <b>Catalog sản phẩm</b>
                </h1>
                {returned}
                <ShoppingCart url = {this.state.url} cart = {this.state.cart}/>
                <button type = 'button' id = 'checkoutbtn'>Thanh toán</button>
                <button type = 'button' id = 'emptyCartBtn'>Xóa tất cả</button>
            </form>
        );
    }
}
export default ProductCatalog;