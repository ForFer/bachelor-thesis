import React, { Component } from 'react';

import UsersTable from './user/usersTable'
import AddUser from './user/addUser'

class Users extends Component {
    constructor(props){
        super(props)
        
        this.state = {
            currentUser: props.currentUser,

            list_users_selected: true,
            add_user_selected: false,

            display_none: 'none',
            display: '',
        }

        this.setListSelected = this.setListSelected.bind(this);
        this.setAddSelecter = this.setAddSelecter.bind(this);
    }

    setListSelected() {
        this.setState({
            list_users_selected: true,
            add_user_selected: false,
        })
    }

    setAddSelecter(){
        this.setState({
            list_users_selected: false,
            add_user_selected: true,
        })
    }


    render(){
        if(!this.state.currentUser){
            return <div></div>
        }

        return (
            <div className="user_container">
                <div className="navbar-options row search_header">
                    <div className={(this.state.list_users_selected) 
                                            ? 'selected col-sm-6 navbar-option admin_entries'
                                            : 'col-sm-6 navbar-option admin_entries'}
                        onClick={this.setListSelected}>
                        Listado de usuarios (permite editar y borrar)
                    </div>
                    <div className={(this.state.add_user_selected) 
                                            ? 'selected col-sm-6 navbar-option add_entry'
                                            : 'col-sm-6 navbar-option add_entry'}
                        onClick={this.setAddSelecter}>
                        Añadir usuario
                    </div>
                </div>

                <div className="search_wrapper" 
                    style={{display: this.state.list_users_selected
                        ? this.state.display 
                        : this.state.display_none}}>
                    <UsersTable 
                        currentUser={this.state.currentUser}
                        base_url={this.state.base_url}/>
                </div>
                <div className="add_user_wrapper" 
                    style={{display: this.state.add_user_selected
                        ? this.state.display 
                        : this.state.display_none}}>
                    <AddUser />
                </div>
                
            </div>
        )
    }

}

export default Users;