import React, {useState, Component} from 'react';

export default class SearchBar extends Component {

    handleQuery(e: React.FormEvent) {
        e.preventDefault();
        console.log(e);
        //TODO: Connect to API and get response back.
    }

    render() {
        return(
            <form onSubmit={ (e: React.FormEvent) => {this.handleQuery(e);}}>
            <label form="fname">Query to GPT</label><br/>
            <input type="text" id="fname" name="fname"/>
            <input type="submit" value="Submit"/>
            </form>
        );
    }
}