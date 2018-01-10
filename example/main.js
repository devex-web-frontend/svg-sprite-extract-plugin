import iconClearId from './icons/icon-clear.svg';
import iconEditId from './icons/icon-edit.svg';
import iconBoughtSold from './icons/icon-bought-sold.svg';
import iconGradient from './icons/icon-gradient.colored.svg';
import loader from './icons/loader.svg';

const iconsIds = [iconClearId, iconEditId, iconBoughtSold, iconGradient, loader];
const body = document.querySelector('body');
const ns = 'http://www.w3.org/2000/svg';

iconsIds.forEach(iconId => {
	const svg = document.createElementNS(ns, 'svg');
	svg.classList.add('icon');
	const use = document.createElementNS(ns, 'use');
	use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${iconId}`);
	svg.appendChild(use);
	body.appendChild(svg);
});