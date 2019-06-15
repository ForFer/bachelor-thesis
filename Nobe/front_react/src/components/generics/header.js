import React, { Component } from 'react';

import { Redirect, Link } from 'react-router-dom';

import axios from 'axios';

const base_url = "http://127.0.0.1:8000"

function Greeting(props) {
    var url = window.location.href.split('/')
    var current_location = url[url.length-1]
    if(props.userName !== ""){
        return <div className="user_profile_wp">
                    <div className="up_greeting">
                        Bienvenido, {props.userName}    
                    </div>
                    <div className="up_dropdown">
                        { current_location !== 'profile'
                            ? <div className="row dropdown_item"
                                    onClick={props.redirectToProfile}
                                >
                                    Sección administrador
                                </div>
                            : null
                        }
                        <div className="row dropdown_item"
                            onClick={props.onClickEdit}
                        >
                            Editar tus datos
                        </div>
                        <div className="row dropdown_item"
                            onClick={props.onClickLogout}
                        >
                            Cerrar sesión
                        </div>
                    </div>
              </div>

        // return <a className="nav-link active login-landing" href="/profile">Bienvenido, {props.userName}</a>;
    } else {
        return <a className="nav-link active login-landing" href="/login">Login</a>;
    }
}

class Header extends Component {
    constructor(props){
        super(props)

        this.state = {
            minimalisticHeader: props.minimalisticHeader || false,
            redirectToLogin: false,
            redirectToProfile: false,
            redirectToLanding: false,

            user: {
                username: '',
                email: '',
                password: '',
                id: '',
            },
            
            display_edit_modal: 'none',
            editUser_username: '',
            editUser_email: '',
            editUser_password: '',
            editUser_password_repeated:'',
            editUser_id: '',
            errorMessage: '',
        }

        this.logout = this.logout.bind(this);
        this.onClickEdit = this.onClickEdit.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this.redirectToProfile = this.redirectToProfile.bind(this);
        this.redirectToLanding = this.redirectToLanding.bind(this);

        this.fetchUserMeta = this.fetchUserMeta.bind(this);

        this.onChangeEditUsername = this.onChangeEditUsername.bind(this);
        this.onChangeEditPassword = this.onChangeEditPassword.bind(this);
        this.onChangeEditPasswordRepeated = this.onChangeEditPasswordRepeated.bind(this);
        this.onChangeEditEmail = this.onChangeEditEmail.bind(this);

        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillMount(){
        this.fetchUserMeta()
    }

    fetchUserMeta() {
        let token = localStorage.getItem("token");
        if(token){
            axios.get(base_url + '/user_meta/', 
            {
                headers: {
                    'Authorization': `Token ${token}`,
                }
            }).then(
                res => {
                    this.setState(() => {
                        localStorage.setItem("user", res.data.user.id);
                        if(this.props.didLoadCurrentUser) this.props.didLoadCurrentUser(res.data.user.id);
                        return {
                        user: res.data.user,
                        editUser_username: res.data.user.username,
                        editUser_email: res.data.user.email,
                        editUser_id: res.data.user.id,
                        }
                    })
                    
                }
            ).catch(
                error => {
                    this.logout();
                }
            )
        }
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.setState({
            redirectToLanding: true,
            // redirectToLogin: true,
            user: {},
        })
    }

    redirectToProfile() {
        this.setState({
            redirectToProfile: true,
        })
        document.body.classList.remove("landing")
    }

    redirectToLanding() {
        this.setState({
            redirectToLanding: true,
        })
    }

    closeModal() {
        this.setState({
            display_edit_modal: 'none',
        })
    }

    onClickEdit() {
        this.setState({
            display_edit_modal: '',
        })
    }

    onChangeEditUsername = (e) => {
        this.setState({editUser_username: e.target.value})
    }

    onChangeEditEmail = (e) => {
        this.setState({editUser_email: e.target.value})
    }

    onChangeEditPassword = (e) => {
        var password = e.target.value;
        var errorMessage = this.state.errorMessage;

        errorMessage = this.state.editUser_password_repeated !== password 
                ? "Las contraseñas no coinciden"
                : ''
 
        this.setState({
            editUser_password: password,
            errorMessage: errorMessage,
        })
    }

    onChangeEditPasswordRepeated = (e) => {

        var password = e.target.value;
        var errorMessage = this.state.errorMessage;

        errorMessage = this.state.editUser_password !== password 
                ? "Las contraseñas no coinciden"
                : ''
 
        this.setState({
            editUser_password_repeated: password,
            errorMessage: errorMessage,
        })
    }

    onSubmit() {
        var _data = {}
        var _method = 'patch';

        if (this.state.editUser_username !== ''){
            _data['username'] = this.state.editUser_username
        } else {
            this.setState({
                errorMessage: 'Campo usuario no puede estar vacio'
            })
            return null;
        }

        if (this.state.editUser_email !== ''){
            _data['email'] = this.state.editUser_email
        } else {
            this.setState({
                errorMessage: 'Campo email no puede estar vacio'
            })
            return null;
        }

        if(!this.state.new_userpassword !== this.state.new_userpassword_repeated){
            this.setState({
                errorMessage: "Las contraseñas no coinciden"
            })
            return null;
        }

        if (this.state.editUser_password !== ''){
            _data['password'] = this.state.editUser_password
            _method = 'put';
        }

        axios({
            method: _method,
            url: base_url + `/user/${this.state.editUser_id}/`,
            data: _data,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Token ${localStorage.getItem("token")}`,
            },
          }).then(
              res => {

                if(this.state.user.id === this.state.editUser_id
                    && this.state.editUser_password !== ''
                    ) {
                    window.alert("Tus datos han sido modificados correctamente, tienes que hacer login de nuevo");    
                    this.logout();
                }
                else {
                    this.setState({
                        editUser_password: '',
                        user: _data,
                    });
                    this.closeModal();
                    window.alert("Usuario modificado correctamente");
                    
                }
              }
          ).catch(
              error => {
                    window.alert(error.response);
                    this.setState({
                        errorMessage: error.response.data
                    })
              }
          );
    }

    render(){
        // User is not logged in, and request is made from profile
        var current_url = window.location.toString().split("/")
        var current_view = current_url[current_url.length-1]

        if (this.state.redirectToLanding) {
            return <Redirect to='' />
        }

        if(!localStorage.getItem("token") 
            && current_view === "profile"
            && !localStorage.getItem("user")
            ) {
            return <Redirect to='/login' />
        }

        // Header view for landing, without user logged in
        if (this.state.minimalisticHeader && !this.state.user.username){
            return <Link className="nav-link active login-landing" 
                         to="/login">
                            Login
                    </Link>
        }

        // Header view for landing, with user logged in
        if(this.state.minimalisticHeader && this.state.user.username) {
            return <Link className="nav-link active login-landing" 
                         to="/profile">
                            Bienvenido, {this.state.user.username}
                         </Link>
        }

        if (this.state.redirectToLogin) {
            return <Redirect to='/login' />
        }

        if (this.state.redirectToProfile) {
            return <Redirect to='/profile' />
        }

        return (
            
            <div className="row profile-header">
                <div className="modal_entry"  style={{display: this.state.display_edit_modal}} >
                    <div className="modal_users">
                        <div className="form_edit_user height_100">
                            <h3> Editar usuario </h3>
                            <form>
                                <label className="username_label">Usuario</label>
                                <input value={this.state.editUser_username}
                                        onChange={this.onChangeEditUsername}
                                        type="text"
                                        required
                                        />

                                <label className="useremail_label">Email</label>
                                <input value={this.state.editUser_email}
                                        onChange={this.onChangeEditEmail}
                                        type="email"
                                        required
                                        />

                                <label className="userpass_label">Contraseña</label>
                                    <input
                                        value={this.state.editUser_password}
                                        placeholder=""
                                        onChange={this.onChangeEditPassword}
                                        type="password"
                                        />
                                <label className="userpass_label">Contraseña</label>
                                    <input
                                        value={this.state.editUser_password_repeated}
                                        placeholder=""
                                        onChange={this.onChangeEditPasswordRepeated}
                                        type="password"
                                        />
                                <div className="warn edit_user_password">
                                    Si no se modifica la contraseña, se mantendrá su valor anterior
                                </div>

                                <div>{this.state.edit_error_message}</div>

                                <button type="button" 
                                        id="edit_user_edit"
                                        className="btn btn-primary" 
                                        onClick={this.onSubmit}>
                                        Editar 
                                        </button>

                                <button onClick={this.closeModal} 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        data-dismiss="modal">
                                        Cancelar
                                        </button>
                                <div className="login_error">{this.state.errorMessage}</div>
                            </form>
                        </div>
                    </div>
                </div>
                

                <div id="app_logo"
                    onClick={this.redirectToLanding}
                    >
                        <h1> Nobe </h1>
                </div>
                <div id="profile-avatar">
                
                    <Greeting 
                        userName={this.state.user.username}
                        onClickLogout={this.logout}
                        onClickEdit={this.onClickEdit}
                        redirectToProfile={this.redirectToProfile}
                        />
                </div>
            </div>
            )
        }    
}
                
export default Header;