import React, { Component } from 'react';

import Entries from './entries';
import Users from './users';

import Header from './generics/header'

class Profile extends Component {
    constructor(props){
        super(props)

        this.state = {
            body_class: document.body.className,
            base_url: props.base_url,

            admin_entries_selected: true,
            
            admin_users_selected: false,
            list_users_selected: true,

            display_none: 'none',
            display: '',

            currentUser: '',
        }

        this.setAdminSelected = this.setAdminSelected.bind(this);
        this.setEntriesSelected = this.setEntriesSelected.bind(this);

        this.didLoadCurrentUser = this.didLoadCurrentUser.bind(this);

    }

    setAdminSelected() {
        this.setState({
            admin_entries_selected: true,
            admin_users_selected: false,

        })
    }

    setEntriesSelected() {
        this.setState({
            admin_entries_selected: false,
            admin_users_selected: true,
        })
    }

    didLoadCurrentUser(id) {
        this.setState({
            currentUser: id,
        })
    }

    render() {
        return (
            <div className="profile-container">

                <Header
                    didLoadCurrentUser={this.didLoadCurrentUser}
                />
                
                <div className="navbar-options row">
                    <div className={(this.state.admin_entries_selected) 
                                        ? 'selected col-sm-6 navbar-option'
                                        : 'col-sm-6 navbar-option'}
                        onClick={this.setAdminSelected}>
                        Administrar registros
                        </div>
                    <div className={(this.state.admin_users_selected) 
                                        ? 'selected col-sm-6 navbar-option'
                                        : 'col-sm-6 navbar-option'}
                        onClick={this.setEntriesSelected}>
                        Administrar usuarios
                        </div>
                </div>
                <div className="data-container" 
                    style={{display: this.state.admin_entries_selected
                                        ? this.state.display 
                                        : this.state.display_none}}>
                    <Entries show={this.state.list_entries_selected} 
                            base_url={this.state.base_url} 
                            />
                </div>
                <div 
                    style={{display: this.state.admin_users_selected
                                        ? this.state.display 
                                        : this.state.display_none}}>
                    {
                        (this.state.currentUser)
                        ? <Users currentUser={this.state.currentUser} />
                        : null
                    }
                    
                </div>
            </div>
        )
    }
}

export default Profile;