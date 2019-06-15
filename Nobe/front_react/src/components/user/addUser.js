import React, { Component } from 'react';

import axios from 'axios';

const base_url = "http://127.0.0.1:8000"

class AddUser extends Component {
    constructor(props){
        super(props)

        this.state = {
            new_username: '',
            new_useremail: '',
            new_userpassword: '',
            new_userpassword_repeated: '',
            errorMessage: '',
        }

        this.onChangeNewUser = this.onChangeNewUser.bind(this);
        this.onChangeNewEmail = this.onChangeNewEmail.bind(this);
        this.onChangeNewPassword = this.onChangeNewPassword.bind(this);

        this.createUser = this.createUser.bind(this);
        this.onChangeNewPasswordRepeated = this.onChangeNewPasswordRepeated.bind(this);
    }

    onChangeNewUser = (e) => {
        this.setState({
            new_username: e.target.value,
        })
    }

    onChangeNewEmail = (e) => {
        this.setState({
            new_useremail: e.target.value,
        })
    }

    onChangeNewPassword = (e) => {

        var password = e.target.value;
        var errorMessage = this.state.errorMessage;

        errorMessage = this.state.new_userpassword_repeated !== password 
                ? "Las contraseñas no coinciden"
                : ''
 
        this.setState({
            new_userpassword: password,
            errorMessage: errorMessage,
        })
    }

    onChangeNewPasswordRepeated = (e) => {
        var password = e.target.value;
        var errorMessage = this.state.errorMessage;

        errorMessage = this.state.new_userpassword !== password 
                ? "Las contraseñas no coinciden"
                : ''
 
        this.setState({
            new_userpassword_repeated: password,
            errorMessage: errorMessage,
        })
    }

    createUser() {

        console.log(this.state)

        if(!this.state.new_username){
            this.setState({
                errorMessage: "Introduce usuario por favor"
            })
            return null;
        }

        if(!this.state.new_useremail){
            this.setState({
                errorMessage: "Introduce email por favor"
            })
            return null;
        }

        if(!this.state.new_userpassword){
            this.setState({
                errorMessage: "Introduce contraseña por favor"
            })
            return null;
        }

        if(this.state.new_userpassword !== this.state.new_userpassword_repeated){
            this.setState({
                errorMessage: "Las contraseñas no coinciden"
            })
            return null;
        }

        var postData = {
            'username': this.state.new_username,
            'email':this.state.new_useremail,
            'password': this.state.new_userpassword,
        };

        axios.post(base_url + '/user/',
            postData,
                { 
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Authorization': `Token ${localStorage.getItem("token")}`,
                    }
                }
        ).then(
            res => {
                this.setState({
                    errorMessage: '',
                    new_username: '',
                    new_useremail: '',
                    new_userpassword: '',
                    new_userpassword_repeated: '',
                })
                window.alert("¡Usuario creado correctamente!")
            }
        ).catch (
            error => {
                var error_message = "";
                var res = error.response.data;
                if(res.email) error_message += res.email + "\n"
                if(res.username) error_message += res.username + "\n"
                if(res.password) error_message += res.password + "\n"

                this.setState({
                    errorMessage: error_message
                })
            }
        )
    }

    render() {
        return (
            <div className="adduser_wrapper margin_auto">
                <div className="adduser_info_wp">
                    <div className=""> <h3> Añadir un usuario </h3> </div>
                    <div className="warn"> El usuario tendrá todos los 
                        permisos para crear, consultar, editar y borrar registros y otros usuarios
                        </div>
                </div>
                <div className="form_add_user height_100">
                    <form>
                        <label className="username_label">Usuario</label>
                        <input value={this.state.new_username}
                                onChange={this.onChangeNewUser}
                                type="text"
                                />

                        <label className="useremail_label">Email</label>
                        <input value={this.state.new_useremail}
                                onChange={this.onChangeNewEmail}
                                type="email"
                                />

                        <label className="userpass_label">Contraseña</label>
                            <input value={this.state.new_userpassword}
                                onChange={this.onChangeNewPassword}
                                type="password"
                                />

                        <label className="userpass_label">Repite la contraseña</label>
                            <input value={this.state.new_userpassword_repeated}
                                onChange={this.onChangeNewPasswordRepeated}
                                type="password"
                                />
                    </form>
                </div>
                <button 
                    className="btn_create_user"
                    onClick={this.createUser}> 
                    Crear usuario </button>
                <div className="login_error">
                    {this.state.errorMessage}                    
                </div>
            </div>
        )
    }
}

export default AddUser;


//    {/* <div className="login_error" >{this.state.error_message}</div> */}
