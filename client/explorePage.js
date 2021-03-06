import React, { Component } from 'react';
import {
  StyleSheet,
  AsyncStorage,
  View,
  Text,
  TouchableHighlight,
  CameraRoll,
  Image,
  ScrollView,
  Dimensions,
  AlertIOS
} from 'react-native';
import { Font } from 'exponent';
import { Container, Header, Title, Content, Footer, InputGroup, Input, Button } from 'native-base';
import { Ionicons } from '@exponent/vector-icons';

const STORAGE_KEY = 'id_token';

export default class ExplorePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageList: [],
      fontLoaded: false
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'pacifico': require('./assets/fonts/Pacifico.ttf'),
    });
    this.setState({ fontLoaded: true });
    this.fetchMemories();
  }

  _navigate(image) {
    this.props.navigator.push({
      name: 'Memory',
      passProps: {
        'image': {uri: image.uri},
        'id': image.id,
        'prevScene': 'ExplorePage'
      }
    });
  }

  async fetchMemories() {
    const context = this;
    this.setState({searching: false});
    try {
      var token =  await AsyncStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.log('AsyncStorage error: ' + error.message);
    }

    fetch(`https://spooky-tagme.herokuapp.com/api/memories/allTagMemories/${this.props.tag}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then((memories) => {

      const memoryArray = JSON.parse(memories['_bodyInit']);
      const images = memoryArray.map(memory => {
        return {
          id: memory._id,
          uri: memory.filePath
        };
      });

      context.setState({
        imageList: images,
        searching: true
      });

    });
  }

  render() {
    return (
      <Container style={ {backgroundColor: 'white'} }>
        {
          this.state.fontLoaded ? (
            <Header>
            <Button transparent onPress={() => this.props.navigator.pop()}>
            <Ionicons name="ios-arrow-back" size={32} style={{color: '#25a2c3', marginTop: 5}}/>
            </Button>
            <Title style={styles.headerText}>{this.props.tag}</Title>

            </Header>
            ) : null
        }

        <Content contentContainerStyle={{
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          {this.state.imageList.length > 0 ? this.state.imageList.map(image =>
              <TouchableHighlight key={image.id} onPress={this._navigate.bind(this, image)}>
              <Image style={styles.thumbnail} resizeMode={Image.resizeMode.cover} source={{uri: image.uri}}/>
              </TouchableHighlight>
              ) : null
          }
        </Content>
      </Container>
      );
  }
}

const styles = StyleSheet.create({
  headerText: {
    ...Font.style('pacifico'),
    fontSize: 30,
    color: '#444',
    paddingTop: 25
  },

  thumbnail: {
    width: (Dimensions.get('window').width- 8) / 4,
    height: (Dimensions.get('window').width- 8) / 4,
    margin: 1,
    backgroundColor: '#EBEBEB'
  }
});
