import style from './style.css';
import { useState, useEffect } from 'preact/hooks';

export const Timer = ({ timer }) => {
	const [ displayTime, setDisplayTime ] = useState('');
	
	useEffect(() => {
		setDisplayTime(Math.trunc(timer / 1000).toString().padStart(4, 0));
	}, [ timer ]);

	return <span>{ displayTime }</span>;
};