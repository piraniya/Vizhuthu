

import {Fragment, useState,useEffect} from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import StripeCheckout from 'react-stripe-checkout';
import '../assets/css/styles.css' 

export default function Cart({cartItems, setCartItems}) {
    
    const [complete, setComplete] = useState(false);
    const [cashOnDelivery, setCashOnDelivery] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [hasOrders, setHasOrders] = useState(false);
    const userId = localStorage.getItem("userId");
    
    function increaseQty(item) {
        if (item.product.stock == item.qty) {
            return;
        }
        const updatedItems = cartItems.map((i) => {
            if(i.product._id == item.product._id) {
                i.qty++
            }
            return i;
        })
        setCartItems(updatedItems)
        
    }

    function decreaseQty(item) {
        if (item.qty > 1) {
            const updatedItems = cartItems.map((i) => {
                if(i.product._id == item.product._id) {
                    i.qty--
                }
                return i;
            })
            setCartItems(updatedItems)
        }
    }

    function removeItem(item) {
        const updatedItems = cartItems.filter((i) => {
            if(i.product._id !== item.product._id) {
                return true;
            }
        })
        setCartItems(updatedItems)
    }

    function placeOrderHandler() {
        fetch("http://localhost:4009/api/v1/order", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId, cashOnDelivery, cartItems})
        })
        .then(() => { 
            setCartItems([]); 
            setComplete(true);
            toast.success("Order Success!")
        })
    }

    const makePayment = (token) => {
       const body = {
            token,
            cartItems
        }
        const headers = {
            "Content-Type": "application/json"
        }
        return fetch("http://localhost:4009/api/v1/payment",{
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        }).then((response)=> {
            console.log(response);
            placeOrderHandler() 
            setCartItems([]); 
            setComplete(true);
        }).catch((error)=> {
            console.log(error);
        })
    }

   // order post model start
   const [formData, setFormData] = useState({
    userName: '',
    phoneNo: '',
    address: '',
  });

  const openFormHandler = () => {
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const checkUserId = async () => {
    try {
      const response = await fetch(`http://localhost:4009/api/v1/check-user-orders/${userId}`);
      console.log(response)
      if (response.ok) {
        const data = await response.json();
        setHasOrders(data.hasOrders);
      } else {
        console.error('Failed to check user orders');
      }
    } catch (error) {
      console.error('Error checking user orders:', error);
    }
  };

  useEffect(() => {
    checkUserId();
  }, [userId]);

  const submitFormHandler = async () => {
    try {
        const formDataWithUserId = {
            ...formData,
            userId: userId,
          };
        const response = await fetch('http://localhost:4009/api/v1/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataWithUserId),
        });
  
        if (!response.ok) {
          throw new Error('Failed to submit form data');
        }
        console.log('Form data submitted successfully');
      } catch (error) {
        console.error('Error submitting form data:', error);
      }

    // Close the form after submitting
    checkUserId();
    setIsFormOpen(false);
  };
// order post model end


    return  cartItems.length > 0 ? <Fragment>
               <div className="container container-fluid" style={{ paddingTop: '16vh' ,paddingBottom:'10vh'}}>
                <h2 className="mt-5">Your Cart: <b>{cartItems.length} items</b></h2>
                <div className="row d-flex justify-content-between dish-box" style={{ border: '2px solid #ccc', padding: '20px', backgroundColor: '#f9f9f9' }}>
                    <div className="col-12 col-lg-8">
                        {cartItems.map((item, index) => (
                            <Fragment key={index}>
                                <hr />
                                <div className="cart-item">
                                    <div className="row">
                                      
                                        <div className="col-5 col-lg-3">
                                            <img src={item.product.image.url} alt={item.product.name} height="300" width="400" style={{ borderRadius: '20px' }} />
                                            
                                        </div>
                                        <div className="col-5 col-lg-3">
                                            <Link to={"/product/" + item.product._id} style={{ textDecoration: 'none', color: 'black',fontSize:'30px' }}>{item.product.name}</Link>
                                        </div>
                                        <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                            <p id="card_item_price">Rs.{item.product.price}</p>
                                        </div>
                                        <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                            <div className="stockCounter d-inline">
                                                <span className="btn btn-danger minus" onClick={() => decreaseQty(item)}>-</span>
                                                <input type="number" className="form-control count d-inline" value={item.qty} readOnly />
                                                <span className="btn btn-primary plus" onClick={() => increaseQty(item)}>+</span>
                                            </div>
                                        </div>
                                        <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                                            <i id="delete_cart_item" onClick={() => removeItem(item)} className="fa fa-trash btn btn-danger" style={{ cursor: 'pointer' }}></i>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>)
                            )}
                        
                        </div>

                        <div class="col-12 col-lg-3 my-4 dish-box">
                            <div id="order_summary ">
                                <h4>Order Summary</h4>
                                <hr />
                                <p>Subtotal: <span class="order-summary-values">{cartItems.reduce((acc,item)=> (acc + item.qty), 0)} (Units)</span></p>
                                <p>Est. total: <span class="order-summary-values">Rs{Number(cartItems.reduce((acc,item)=> (acc + item.product.price * item.qty), 0)).toFixed(2)}</span></p>

                                <hr />
                      
                        



                               <input
                              type="radio"
                              id="cashOnDeliveryTrue"
                              name="cashOnDelivery"
                              value={true}
                              checked={cashOnDelivery}
                              onChange={() => setCashOnDelivery(true)}
                             />
                             <label htmlFor="cashOnDeliveryTrue">Cash on Delivery</label>
                             <input
                              type="radio"
                              id="cashOnDeliveryFalse"
                              name="cashOnDelivery"
                              value={false}
                              checked={!cashOnDelivery}
                              onChange={() => setCashOnDelivery(false)}
                             />
                             <label htmlFor="cashOnDeliveryFalse">Online Payment</label>
                        {hasOrders ? (
                            <button
                              id="checkout_btn"
                              onClick={placeOrderHandler}
                              className="btn btn-primary btn-block"
                              style={{ display: cashOnDelivery ? 'block' : 'none' }}
                            >
                              Cash on Delivery
                            </button>
                            ) : ( <button id="checkout_btn" onClick={openFormHandler} className="btn btn-primary btn-block" style={{ display: cashOnDelivery ? 'block' : 'none' }}>
                            Place Order
                          </button>
                        )}
                            {hasOrders ? (
                            <StripeCheckout 
                            stripeKey='pk_test_51OtXhpIYbWOlM8JLBFZDHkYAAwidRnG7uDrSqsdhfMMK8aKOjuzIF7ZJeI2mHEzQaleY6myNn5HoSiIf3gKfLgmm00j5pn2SPu'
                            token={(token) => makePayment(token)}
                            currency='LKR'
                                   name={cartItems.length > 0 ? cartItems[0].product.name : 'Default Name'}
                                   amount={cartItems.length > 0 ? cartItems[0].product.price * 100 : 0}
                                 >
                                   <button id="checkout_btn" className="btn btn-primary btn-block" style={{ display: cashOnDelivery ? 'none' : 'block' }}>
                                      Place Order
                                    </button>
                                  </StripeCheckout>
                                  ) : ( <button id="checkout_btn" onClick={openFormHandler} className="btn btn-primary btn-block" style={{ display: cashOnDelivery ? 'none' : 'block' }}>
                                  Place Order
                                </button>
                              )}
                                {isFormOpen && (
                               <div className="popup-form">
                                 <label>
                                   User Name:
                                   <input type="text" name="userName" value={formData.userName} onChange={handleInputChange} />
                                 </label>
                                 <label>
                                   Phone No:
                                   <input type="number" name="phoneNo" value={formData.phoneNo} onChange=                       {handleInputChange} />
                                 </label>
                                 <label>
                                   Address:
                                   <input type="text" name="address" value={formData.address} onChange=                       {handleInputChange} />
                                 </label>

                                 <button onClick={submitFormHandler}>Submit</button>
                                 <ToastContainer />
                               </div>
                             )}

                            </div>
                        </div>
                    </div>
                </div>
            </Fragment> : (!complete ? <h2 className='' style={{marginTop:'35vh',marginLeft:'80vh',marginBottom:'35vh'}}>Your Cart is Empty!</h2> 
            : <Fragment>
                <h2 className='mt-5' style={{marginTop:'35vh',marginLeft:'50vh',marginBottom:'35vh'}}>Order Complete!</h2>
                <p style={{marginTop:'35vh',marginLeft:'50vh',marginBottom:'35vh',fontSize:'5vh'}}>Your order has been placed succesfully.</p>
            </Fragment>)
}