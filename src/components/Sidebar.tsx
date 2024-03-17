// components/Sidebar.js import './Sidebar.css' // components/Sidebar.js 
import Link from 'next/link';
import styles from './Sidebar.module.css';
// Import the CSS module 
export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <ul className={styles.sidebarList}>
        <li className={styles.sidebarItem}>
          <Link href="/" className={styles.sidebarLink}> Home </Link>
        </li> <li className={styles.sidebarItem}>
          <Link href="/Dashboard" className={styles.sidebarLink}> Dashboard </Link>
        </li> <li className={styles.sidebarItem}>
          <Link href="/CustomerListPage" className={styles.sidebarLink}> Customers List </Link> </li>
        <li className={styles.sidebarItem}> <Link href="/VisitsList" className={styles.sidebarLink}> Visits List </Link> </li>
        <li className={styles.sidebarItem}> <Link href="/Employeelist" className={styles.sidebarLink}> Employee list </Link> </li>
        {/* <li className={styles.sidebarItem}> <Link href="/CustomerDetailPage" className={styles.sidebarLink}> Customer Details </Link> </li>
        <li className={styles.sidebarItem}> <Link href="/VisitDetailPage" className={styles.sidebarLink}> Visit Details </Link> </li>
        <li className={styles.sidebarItem}> <Link href="/SalesExecutivePage" className={styles.sidebarLink}> Sales Executives </Link> </li> */}
      </ul>
    </div>
  );
}