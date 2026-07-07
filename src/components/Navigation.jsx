import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

function Navigation() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand href="/" className="fw-bold">
          <i className="fas fa-lungs me-2 text-primary"></i>
          Medical AI
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link href="/dashboard">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </Nav.Link>
                <Nav.Link href="/upload">
                  <i className="fas fa-upload me-2"></i>
                  Upload & Analyze
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                  <i className="fas fa-user-circle me-2"></i>
                  {user.email}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.ItemText>
                    <small className="text-muted">Signed in as</small><br />
                    <strong>{user.email}</strong>
                  </Dropdown.ItemText>
                  <Dropdown.Divider />
                  <Dropdown.Item href="/dashboard">
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item href="/upload">
                    <i className="fas fa-upload me-2"></i>
                    Upload Images
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Nav.Link href="/login" className="me-2">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </Nav.Link>
                <Nav.Link href="/register">
                  <i className="fas fa-user-plus me-1"></i>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
