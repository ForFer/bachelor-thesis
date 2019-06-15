import React, { Component } from 'react';

import axios from 'axios';

import Header from './generics/header'

class Landing extends Component {
    constructor(props){
        super(props)

        this.state = {
            body_class: document.body.className,
            query_text: '',
            base_url: props.base_url,
        }

        this.search_query = this.search_query.bind(this)
        this.searchTextChange = this.searchTextChange.bind(this)
    }

    searchTextChange(event) {
        this.setState({query_text : event.target.value});
    }

    search_query() {
        axios.get(this.state.base_url + '/entries/',
        {
            params: {
                q: this.state.query_text,
            }
        })
            .then(
                res => {
                    this.props.history.push({
                        pathname: '/search',
                        state: {
                            detail: res.data,
                            query: this.state.query_text,
                            base_url: this.state.base_url,
                         }
                    })
                }
            )
    }

    componentWillMount(){
        document.body.className = this.state.body_class 
                    + ( this.state.body_class ? ' ' : '') 
                    + 'text-center height_100 landing';
    }

    componentWillUnmount(){
        document.body.className = this.state.body_class;
    }

    /*
        text-center height_100 landing
    */

    render() {
        return (
            <div className="d-flex w-100 h-100 p-3 mx-auto flex-column wrapper_main">
            <header className="masthead mb-auto">
                <div className="inner">
                <h3 className="float-left">Nobe</h3>
                <nav className="nav justify-content-center float-right">
                    <Header minimalisticHeader={true} />
                </nav>
                </div>
            </header>
    
            <main role="main" className="inner" id="inner_wrapper">
                <h1>Comienza tu búsqueda aquí </h1>
                <p className="lead">Nobe te permite buscar texto en imágenes manuscritas</p>
                <div className="col-xs-12 display_block">
                    <input onChange={this.searchTextChange} 
                            
                            onKeyPress = { (e) => {
                                    if(e.key === 'Enter') {
                                        this.search_query();
                                    }
                                }
                            }
                                
                            type="text" 
                            id="searchBar" 
                            className="form-control main-search-bar col-xs-10 display_inline_block" 
                            placeholder="Érase una vez..." 
                            required="" 
                            autoFocus={true}/>
                    <span className="input-group-btn col-xs-2 main-span-button">
                        <button onClick={this.search_query} className="btn btn-search main-search-button" type="button">
                            <i className="fa fa-search fa-fw display_inline_block"></i>
                        </button>
                    </span>
                </div>
    
            </main>
    
            <footer className="mastfoot mt-auto">
                <div className="inner">
                <p>Trabajo de Fin de Grado por <a href="https://github.com/ForFer">Fernando Collado</a>, para la © Universidad Carlos III de Madrid, 2019</p>
                </div>
            </footer>
            </div>
    
        )
    }
}

export default Landing;

/*


</html>
*/