import React, { Component } from 'react';

import axios from 'axios';

class Login extends Component {
    constructor(props){
        super(props)

        this.state = {
            body_class: document.body.className,
            username: '',
            password: '',
            base_url: props.base_url,
            error_message: '',
            display_error: 'none'
        }

        this.login = this.login.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.redirect = this.redirect.bind(this)
    }


    componentWillMount(){
        document.body.className = this.state.body_class + 
            ( this.state.body_class ? ' ' : '') + 'text-center display_flex';

        document.body.style = 'background-color:#f5f5f5';

        if(localStorage.getItem("token")){
            this.redirect();
        }
    }

    componentWillUnmount(){
        document.body.className = this.state.body_class;
        document.body.style = '';
    }

    onChangeEmail = (e) => {
        this.setState({username: e.target.value})
    }

    onChangePassword = (e) => {
        this.setState({password: e.target.value})
    }

    redirect() {
        document.body.className = this.state.body_class;
        document.body.style = '';
        document.body.classList.remove("landing")
        this.props.history.push({
            pathname: '/profile',
            state: {
                    username: this.state.username,
                }
        })
    }

    login(e){
        e.preventDefault();

        var postData = {
            'username': this.state.username,
            'password': this.state.password
        };

        axios.post(this.state.base_url + '/login/',
            postData,
            { 
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                }
            }
        )
        .then(
            res => {
                document.body.className = this.state.body_class;
                document.body.style = '';

                localStorage.setItem("token", res.data.token);
                this.redirect();
            }
        )
        .catch(error => {
            let errorMessage = JSON.parse(error.request.response)['non_field_errors'];
            this.setState({
                error_message: errorMessage,
                display_error: '',
            });
        })
        ;
    }

    render(){
        // TODO: add animation to error message
        // const additionalStyles = {
        //     animation: 'shake 10s cubic-bezier(.36,.07,.19,.97) both',
        //     transform: 'translate3d(0, 0, 0)',
        // }
        return (
            <div className="position-relative">
                <div className="float-left left-arrow-go-back" onClick={this.props.history.goBack}>
                    <i className="fas fa-2x fa-arrow-left"></i>
                </div>
                <div className="form_wrapper login_page height_100 margin_auto">
                    <form id="form-signin ">
                        <h1 className="h3 mb-3 font-weight-normal">Por favor, introduce tus credenciales</h1>
                        <label htmlFor="inputUsername" className="sr-only">Usuario</label>
                        <input onChange={this.onChangeEmail} type="username" id="inputUsername" className="form-control margin-b-10" placeholder="Usuario" required="" autoFocus={true}/>
                        <label htmlFor="inputPassword" className="sr-only">Password</label>
                        <input onChange={this.onChangePassword} type="password" id="inputPassword" className="form-control margin-b-10" placeholder="Password" required=""/>
                        <button className="btn btn-lg btn-primary btn-block" 
                                type="submit" 
                                onClick={this.login}>Iniciar sesión</button>

                        <div className="login_error" >{this.state.error_message}</div>

                        <p id="login_info_message" className="mt-5 mb-3 text-muted">Necesitas tener credenciales autorizadas para hacer login, no puedes registrarte por tu cuenta</p>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;