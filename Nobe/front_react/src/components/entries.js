import React, { Component } from 'react';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

import EntryTable from './entry/entryTable'
import AddEntry from './entry/addEntry.js'

class Entries extends Component {
    
    constructor(props){
        super(props)

        this.state = {
            base_url: props.base_url,

            list_entries_selected: true,
            add_entries_selected: false,

            display_none: 'none',
            display: '',
        }

        this.setListSelected = this.setListSelected.bind(this);
        this.setAddSelecter = this.setAddSelecter.bind(this);
    }
  
    setListSelected() {
        this.setState({
            list_entries_selected: true,
            add_entries_selected: false,
        })
    }

    setAddSelecter() {
        this.setState({
            list_entries_selected: false,
            add_entries_selected: true,
        })
    }

    render() {
        return (

        <div className="search_container">
            <div className="navbar-options row search_header">
                <div className={(this.state.list_entries_selected) 
                                        ? 'selected col-sm-6 navbar-option admin_entries'
                                        : 'col-sm-6 navbar-option admin_entries'}
                    onClick={this.setListSelected}>
                    Listado de registros (permite editar y borrar)
                </div>
                <div className={(this.state.add_entries_selected) 
                                        ? 'selected col-sm-6 navbar-option add_entry'
                                        : 'col-sm-6 navbar-option add_entry'}
                    onClick={this.setAddSelecter}>
                    Añadir registro
                </div>
            </div>
        

            <div className="search_wrapper" 
                style={{display: this.state.list_entries_selected
                    ? this.state.display 
                    : this.state.display_none}}>
                <EntryTable base_url={this.state.base_url}/>
            </div>
            <div className="add_user_wrapper" 
                style={{display: this.state.add_entries_selected
                    ? this.state.display 
                    : this.state.display_none}}>
                    <AddEntry />
            </div>
        </div>
            
        )
    }

}

export default Entries;