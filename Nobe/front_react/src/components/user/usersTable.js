import React, { Component } from 'react';
import axios from 'axios';
import { OrderBySelector, Button } from '../generics/searchGenerics'
import UserList from '../user/UserList'

import KeyboardEventHandler from 'react-keyboard-event-handler';

const base_url = "http://127.0.0.1:8000"

/*
function escFunction(event, closeModal){
    if(event.keyCode === 27) {
        closeModal();
    }
}
  componentDidMount(){
        document.addEventListener("keydown", 
                                  (e) => escFunction(e, this.closeLatestModal), 
                                  false);
    }
    componentWillUnmount(){
        document.removeEventListener("keydown", 
                                    (e) => escFunction(e, this.closeLatestModal), 
                                    false);
    }
*/

// TODO: generalize DeleteModal
const DeleteModal = ({user, onClick, selectedId, onCancelClick}) => (
    <div className="delete_user_modal">
        <div className="dm_message">¿Estás seguro de querer borrar el usuario {user}?</div>
        <div className="dm_btn_wrapper">
        <button type="button" 
                className="btn btn-primary" 
                id="dm_btn_delete"
                onClick={() => onClick(selectedId)}>
                Borrar 
                </button>

        <button onClick={onCancelClick} 
                type="button" 
                className="btn btn-secondary" 
                data-dismiss="modal">
                Cancelar
                </button>
        </div>
    </div>
);

function escFunction(event, closeModal){
    event.preventDefaut();
    event.stopPropagation();
    if(event.keyCode === 27) {
        console.log("users")
        closeModal();
    }
}

// Due to setState delay issues, variable managed on a higher level
let page = 0;

class UsersTable extends Component {
    
    constructor(props){
        super(props)

        this.state = {
            current_user: props.currentUser,

            data: {},
            query_text: '',
            
            order_by_username: '',
            order_by_email: '',
            order_by_created: '',

            page_size: 10,

            base_url: props.base_url,
            total_elements: 0,

            waiting_to_change: false,

            modal_display: 'none',
            selected_user_id: '',


            display_delete_modal: '',
            display_edit_modal: '',

            editUser_id: '',
            editUser_username: '',
            editUser_email: '',
            editUser_password: '',
            editUser_password_repeated: '',
            edit_error_message: '',
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.onUserOrder = this.onUserOrder.bind(this)
        this.onEmailOrder = this.onEmailOrder.bind(this)
        this.onCreatedOrder = this.onCreatedOrder.bind(this)

        this.onNextPage = this.onNextPage.bind(this);
        this.onPreviousPage = this.onPreviousPage.bind(this);

        this.fetchData = this.fetchData.bind(this);

        this.getUser = this.getUser.bind(this);
        this.getUserName = this.getUserName.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.confirmRemoveUser = this.confirmRemoveUser.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this.editUser = this.editUser.bind(this);
        this.onChangeEditUsername = this.onChangeEditUsername.bind(this);
        this.onChangeEditPassword = this.onChangeEditPassword.bind(this);
        this.onChangeEditEmail = this.onChangeEditEmail.bind(this);

        this.onSubmitEdit = this.onSubmitEdit.bind(this);

        this.logout = this.logout.bind(this);
    }

    componentDidMount(){
        document.addEventListener("keydownUsers", 
                                  (e) => escFunction(e, this.closeModal), 
                                  false);
    }
    componentWillUnmount(){
        document.removeEventListener("keydownUsers", 
                                    (e) => escFunction(e, this.closeModal), 
                                    false);
    }

    async componentWillMount(){
        this.fetchData();
    }
  
    fetchData(){
        this.setState({total_elements:'', waiting_to_change:true})

        axios.get(base_url + '/users/', 
        {
            params: {
                page_size: this.state.page_size,
                page: page,
                q: this.state.query_text,
                order_username: this.state.order_by_username,
                order_email: this.state.order_by_email,
                order_joined: this.state.order_by_created
            },
            headers: {
                'Authorization': `Token ${localStorage.getItem("token")}`,
            }
        })
        .then(
            res => {
                this.setState({
                    data: res.data,
                    total_elements: res.data.total,
                    waiting_to_change: false,
                })
            }
        )
    }

    handleInputChange = (e) => {
        page = 0;
        this.setState({query_text: e.target.value});
    }

    onUserOrder = (e) => {
        this.setState({order_by_username: e.target.value})
    }
    
    onEmailOrder = (e) => {
        this.setState({order_by_email: e.target.value})
    }

    onCreatedOrder = (e) => {
        this.setState({order_by_created: e.target.value})
    }

    onNextPage(){
        page += 1;
        this.fetchData()
    }

    onPreviousPage(){
        page -= 1;
        this.fetchData()
    }

    closeModal() {
        this.setState({
            modal_display: 'none',
            modal_title: '',
            modal_year: '',
            modal_author: '',
            modal_images: [],
            display_delete_modal: 'none',
            display_edit_modal: 'none',
            selected_user_id: '',
        })
    }

    removeUser(id) {
        this.setState({
            modal_display: '',
            display_delete_modal: '',
            display_edit_modal: 'none',
            selected_user_id: id,
        })
    }

    editUser(id) {        
        this.setState({
            modal_display: '',
            display_delete_modal: 'none',
            display_edit_modal: '',
            selected_user_id: id,
        })

        this.getUser(id);
    }

    confirmRemoveUser(id) {
        axios.delete(base_url + `/user/${id}/`,
            { 
                headers: {
                    'Authorization': `Token ${localStorage.getItem("token")}`,
                }
            })
            .then(
                res => {
                    this.closeModal();
                    window.alert("¡Usuario borrado correctamente!")
                    this.fetchData();
                }
            ).catch(
                error => {
                    window.alert("Ha ocurrido un error: ", error.response)
                }
            )
    }

    onSubmitEdit() {
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

        if(this.state.editUser_email || this.state.editUser_password_repeated){
            if(this.state.editUser_password !== this.state.editUser_password_repeated){
                this.setState({
                    errorMessage: "Las contraseñas no coinciden"
                })
                return null;
            }
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
                if(parseInt(this.state.current_user) === this.state.editUser_id
                    && this.state.editUser_password !== ''
                    ) {
                    window.alert("Tus datos han sido modificados correctamente, tienes que hacer login de nuevo");    
                    this.logout();
                }
                else {
                    this.setState({
                        editUser_id: '',
                        editUser_username: '',
                        editUser_email: '',
                        editUser_password: '',
                        editUser_password_repeated: '',
                    });
                    this.closeModal();
                    window.alert("Usuario modificado correctamente");
                    
                    this.fetchData();
                }
              }
          ).catch(
              error => {
                  this.setState({
                      edit_error_message: error.response
                  })
              }
          );
    }

    getUserName() {
        let filtered_user = this.state.data.users.filter(user => user.id===this.state.selected_user_id );
        return ( filtered_user.length <= 0 )
                ? ""
                : filtered_user[0]
    }

    getUser(id) {
        var _id = id || this.state.selected_user_id;
        let filtered_user = this.state.data.users.filter(user => user.id=== _id );
        
        this.setState({
            editUser_id: id,
            editUser_username: filtered_user[0].username,
            editUser_email: filtered_user[0].email,
            editUser_password: '',
        })
    }

    onChangeEditUsername = (e) => {
        this.setState({editUser_username: e.target.value})
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

    onChangeEditEmail = (e) => {
        this.setState({editUser_email: e.target.value})
    }

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.props.history.push({
            pathname: '/landing',
        })
    }

    render() {
        
        if(!this.state.current_user){
            return <div></div>
        }

        // TODO: modificar behaviour so that solo la tabla se quede sin renderizar hasta 
        // encontrar datos de nuevo
        if ( this.state.total_elements === '' ) {
            return <div />
        }

        if( this.state.waiting_to_change ) {
            return <div />
        }
 
        return (

        <div className="search_container">

            <KeyboardEventHandler
                handleKeys={['esc']}
                isExclusive={false}
                onKeyEvent={(key, e) => this.closeModal()} />

            <div className="modal_entry"  style={{display: this.state.modal_display}} >
                <div className="modal_users">
                    <button type="button" className="close" id="btn_close_modal" aria-label="Close" onClick={this.closeModal}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div style={{display:this.state.display_delete_modal}}>
                        <DeleteModal
                            user={this.getUserName().username}
                            onClick={this.confirmRemoveUser}
                            selectedId={this.state.selected_user_id}
                            onCancelClick={this.closeModal}
                        />
                    </div>
                    <div style={{display:this.state.display_edit_modal}}>
                        <div className="form_edit_user height_100">
                            <h3> Editar usuario </h3>
                            <form>
                                <label className="username_label">Usuario</label>
                                <input value={this.state.editUser_username}
                                        onChange={this.onChangeEditUsername}
                                        type="text"
                                        />

                                <label className="useremail_label">Email</label>
                                <input value={this.state.editUser_email}
                                        onChange={this.onChangeEditEmail}
                                        type="email"
                                        />

                                <label className="userpass_label">Contraseña</label>
                                    <input
                                        value={this.state.editUser_password}
                                        onChange={this.onChangeEditPassword}
                                        type="password"
                                        />
                                <label className="userpass_label">Contraseña</label>
                                    <input
                                        value={this.state.editUser_password_repeated}
                                        onChange={this.onChangeEditPasswordRepeated}
                                        type="password"
                                        />
                                <div className="warn edit_user_password">
                                    Si se deja vacío el campo contraseña, se mantendrá su valor anterior
                                </div>

                                <button type="button" 
                                        id="edit_user_edit"
                                        className="btn btn-primary" 
                                        onClick={this.onSubmitEdit}>
                                        Editar 
                                        </button>

                                <button onClick={this.closeModal} 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        data-dismiss="modal">
                                        Cancelar
                                        </button>

                                <div className="warn"
                                    style={{color:"red"}}
                                    >
                                    {this.state.edit_error_message}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="search_body">
                <div className="search_filters col-xs-4 col-md-2">
                    <div className="sf_category xs-12">
                        Ordenar por...
                    </div>
                    <div className="search_filter sf_border_bottom xs-12">
                        <div className="sf_name">
                            Nombre de usuario
                        </div>
                        <div className="sf_filter">
                            <OrderBySelector
                                onChange={this.onUserOrder}
                                name="order_by_username"
                                value={this.state.order_by_username}
                            />
                        </div>
                    </div>

                    <div className="search_filter sf_border_bottom xs-12">
                        <div className="sf_name">
                            Fecha creación usuario
                        </div>
                        <div className="sf_filter">
                            <OrderBySelector
                                onChange={this.onCreatedOrder}
                                name="order_by_created"
                                value={this.state.order_by_created}
                            />
                        </div>
                    </div>

                    <div className="search_filter sf_border_bottom xs-12">
                        <div className="sf_name">
                            Email
                        </div>
                        <div className="sf_filter">
                            <OrderBySelector
                                onChange={this.onEmailOrder}
                                name="order_by_email"
                                value={this.state.order_by_email}
                            />
                        </div>
                    </div>
                    <div className="search_filter xs-12">
                        <button onClick={this.fetchData} className="sf_name filter_btn">
                            Refinar la busqueda!
                        </button>
                    </div>
                </div>
                <div className="search_results_wrapper col-xs-8 col-md-10">
                    <div className="search_results">
                        <div className="sr_searchbar">
                            <input 
                                onChange={this.handleInputChange} 
                                type="text" 
                                id="searchBarSearch" 
                                className="form-control col-xs-9 display_inline_block" 
                                value={this.state.query_text} 
                                required="" 
                                autoFocus={true}
                                onKeyPress = { (e) => {
                                        if(e.key === 'Enter') {
                                            this.fetchData();
                                        }
                                    }
                                }
                                />
                            <span className="input-group-btn col-xs-2">
                                <button onClick={this.fetchData} className="btn btn-search" type="button">
                                    <i className="fa fa-search fa-fw display_inline_block"></i>
                                </button>
                            </span>
                        </div>
                        <UserList   users={this.state.data.users} 
                                    base_url={this.state.base_url} 
                                    onClick={this.onEntryClick} 
                                    onRemoveClick={this.removeUser}
                                    onEditClick={this.editUser}
                                    editDelete={true}
                                    currentUser={this.state.current_user}
                                    />
                        { this.state.total_elements>0 ? 
                            <div className="pagination_container">
                                <div className="total_elements"> 
                                    {(page*this.state.page_size)+1} - {Math.min(this.state.total_elements, ( (1+page) * this.state.page_size ) )} de {this.state.total_elements}
                                </div>
                                <Button name="previous_page_btn"
                                        disabled={page+1 === 1} 
                                        onClick={this.onPreviousPage}/>
                                <Button name="next_page_btn" 
                                        disabled={page+1 === Math.ceil(this.state.total_elements/this.state.page_size)} 
                                        onClick={this.onNextPage}/>
                            </div>
                            :
                            <div></div>
                        }
                    </div>
                </div>
            </div>

        </div>
            
        )
    }

}

export default UsersTable;