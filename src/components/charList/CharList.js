import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import useMarvelService from '../../services/MarvelService';

import './charList.scss';

const CharList = (props) => {
    const [charList, setCharList] = useState([]);
    const [newItemsLoading, setNewItemsLoading] = useState(false);
    const [offset, setOffset] = useState(210);
    const [charEnded, setCharEnded] = useState(false);

    const { loading, error, getAllCharacters } = useMarvelService();

    useEffect(() => {
        onRequest(offset, true);
    }, []);

    const onRequest = (offset, initial) => {
        initial ? setNewItemsLoading(false) : setNewItemsLoading(true);
        getAllCharacters(offset).then(onCharListLoaded)
    };

    const onCharListLoaded = (newCharList) => {
        let ended = false;
        if (newCharList < 9) ended = true;

        setCharList(charList => [...charList, ...newCharList]);
        setNewItemsLoading(newItemsLoading => false);
        setOffset(offset => offset + 9);
        setCharEnded(charEnded => ended);
    };

    const itemsRefs = useRef([]);

    const focusOnItem = (number) => {
        itemsRefs.current.forEach(item => item.classList.remove('char__item_selected'));
        itemsRefs.current[number].classList.add('char__item_selected');
        itemsRefs.current[number].focus();
    };

    function renderItems(arr) {
        const items =  arr.map((item, i) => {
            let imgStyle = {'objectFit' : 'cover'};
            if (
                item.thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg' || 
                item.thumbnail === 'http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c002e0305708.gif'
            ) {
                imgStyle = {'objectFit' : 'unset'};
            }
            
            return (
                <li 
                    tabIndex={0}
                    ref={el => itemsRefs.current[i] = el}
                    className="char__item"
                    key={item.id}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            props.onCharSelected(item.id);
                            focusOnItem(i);
                        }
                    }}
                    onClick={() => {
                        props.onCharSelected(item.id);
                        focusOnItem(i);
                    }}>    
                        <img src={item.thumbnail} alt={item.name} style={imgStyle}/>
                        <div className="char__name">{item.name}</div>
                </li>
            )
        });

        return (
            <ul className="char__grid">
                {items}
            </ul>
        )
    }
        
    const items = renderItems(charList);

    const errorMessage = error ? <ErrorMessage/> : null;
    const spinner = loading && !newItemsLoading ? <Spinner/> : null;

    return (
        <div className="char__list">
            {errorMessage}
            {spinner}
            {items}
            <button 
                className="button button__main button__long"
                disabled={newItemsLoading}
                style={{display : charEnded ? 'none' : 'block'}}
                onClick={() => onRequest(offset)}>
                <div className="inner">load more</div>
            </button>
        </div>
    )
}

CharList.propTypes = {
    onCharSelected: PropTypes.func.isRequired
}

export default CharList;