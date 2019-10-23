import React, { useState, useEffect } from 'react';
import { withFormik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { axiosWithAuth } from '../utils/axiosWithAuth';
import { withRouter } from "react-router";
import '../test.css';

//need to have a checkbox for student/teacher, and if student, then have a searchform or dropdown to select your teacher
//(loaded from list of users that are teachers from server.)

//need to check if email has already been used to create a user

//need to assign ID to created user when it gets sent to the server

// Empty inline JSX function:
// {(() => {})()}

// userArray = [{teacher},{student},{teacher}];
//  teacher{
//     id:id
//     username:username
//     email:email
//     password:password
//     isTeacher: true;
//     classes: [ [{student},{student},{student}], [{student},{student},{student}], [{student},{student},{student}] ]
//     students: [studentuserid, studentuserid, studentuserid]
//     testBank: [{test}, {test}, {test}]
// }
//  student{
//     id:id
//     username:username
//     email:email
//     password:password
//     isTeacher: false;
//     teacherID: teacherID;
//     teacherName: teacherName;
//     class:class
//     grade:grade
//     assignedTests: [{test}, {test}, {test}]
//     completedTests: [{test}, {test}, {test}]
// }

//notes: search for teacher- maybe only display one to select if you type a username that matches a teacher?
//that way it doesnt show you all teacher on the site

const SignUpForm = ({ setLoggedIn, populateUser, history, values, touched, errors, status }) => {
  const [serverUserList, setServerUserList] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  let initial;

  useEffect(()=>{
    initial = true;
  }, [])
  
  useEffect(() => {
    // redirect to teacher or student dashboard here
    if (!initial){
      console.log(status);
      if (status.newUser.isTeacher){
        populateUser(status.newUser);
        setLoggedIn(true);
        history.push('/Teacher');
      }
      else{
        populateUser(status.newUser);
        setLoggedIn(true);
        history.push('/Student');
      }
    }
    initial = false;
  }, [status]);
  useEffect(() => {
    //axios get all users here, set into local array to search from
    //use array length to set ID of new user
    //filter teachers with search to allow student to choose teacher
    axios
      .get('https://rickandmortyapi.com/api/character/')
      .then(response => {
        // console.log(response);
        //   console.log(response.data.results);
        setServerUserList(response.data.results.slice(0));

        setTeachers(
          serverUserList.filter(usr => {
            return usr.isTeacher === true;
          })
        );

        //!!!! temporary code because rick and morty characters to not have an isTeacher bool
        setTeachers(response.data.results.slice(0));
        //!!!!
      })
      .catch(error => {
        console.error('Server Error: ', error);
      });
  }, []);

  //Teacher search form code. Listens for text inputted into search box, then filters teacher array for names that match.
  //Names that match get displayed in the 'please choose one' dropdown, and the chosen one's id is added to the student object
  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (searchTerm !== '') {
      const results = teachers.filter(char =>
        char.name.toLowerCase().includes(searchTerm)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [teachers, searchTerm]);

  return (
    <div>
      <h1 className='initial'>Sign Up</h1>
      <Form className='signUpForm'>
        <Field
          className='field'
          type='text'
          name='username'
          placeholder='username'
        />
        {touched.username && errors.username && (
          <p className='error'>{errors.username}</p>
        )}
        <br />

        <Field
          className='field'
          type='email'
          name='email'
          placeholder='email'
        />
        {touched.email && errors.email && (
          <p className='error'>{errors.email}</p>
        )}
        <br />

        <Field
          className='field'
          type='password'
          name='password'
          placeholder='password'
        />
        {touched.password && errors.password && (
          <p className='error'>{errors.password}</p>
        )}
        <br />

        <label className='field'>
          <span className='checkmark' />
          Are you a teacher?
          <Field type='checkbox' name='isTeacher' checked={values.isTeacher} />
        </label>
        <br />

        {(() => {
          if (!values.isTeacher) {
            return (
              <label>
                {' '}
                Who is your teacher? <br />
                <Field
                  className='field'
                  type='text'
                  value={searchTerm}
                  placeholder='Teacher Name'
                  onChange={handleChange}
                />
                <br />
                <Field component='select' name='teacherID'>
                  <option>Please Choose an Option</option>
                  {searchResults.map(teach => {
                    return (
                      <option
                        value={teach.id}
                        onChange={() => {
                          console.log(values);
                          values.teacherName = teach.name;
                        }}
                      >
                        {teach.name}
                      </option>
                    );
                  })}
                </Field>
                <br /> <br />
              </label>
            );
          }
        })()}

        {(() => {
          /*  values.id = serverUserList.length; //this is setting the new user's ID based off the length of the server user list.
                    if (values.teacherID !== null){
                        teachers.forEach((teach)=>{
                            if (teach.id === values.id){
                                values.teacherName= teach.name; //this sets the teacherName based off of the values.teacherID which is set in the dropdown.
                            }; //I couldn't easily figure out how to make selecting the dropdown update two values or run an inline function, so I did it here.
                        })
                    } */
        })()}

        <button type='submit'>Submit!</button>
      </Form>
    </div>
  );
};

const SignUp = withFormik({
  mapPropsToValues({
    username,
    email,
    password,
    isTeacher,
    teacherID,
    teacherName,
  }) {
    return {
      username: username || '',
      email: email || '',
      password: password || '',
      isTeacher: isTeacher || false,
      teacherID: teacherID || 0,
      teacherName: teacherName || 'null',
    };
  },

  validationSchema: Yup.object().shape({
    username: Yup.string().required('Please enter your username'),
    email: Yup.string().required('Please enter your email'),
    password: Yup.string().required('Please enter a password')
  }),

  handleSubmit( values, { setStatus }) {
    //Appending vars to form object that do not come from input form here before posting to the server
    values.students = [];
    values.testBank = [];
    values.classes = [];
    values.classSubject = '';
    values.gpa = 0;
    values.assignedTests = [];
    values.completedTests = [];

    axiosWithAuth()
      // values is our object with all our data on it.
      .post('/api/signUp', values)
      .then(res => {
        setStatus(res.data);
      })
      .catch(err => {
        alert(err.response.data.error);
        console.log(err.response);
      });
  }
})(SignUpForm);

export default SignUp;

