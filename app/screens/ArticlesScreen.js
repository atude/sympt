import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';
import { UserContext, DiseaseContext, PromedFeedContext } from '../context/context';
import { getFeedArticles } from '../functions/articleFunctions';
import ArticleCard from '../components/ArticleCard';
import StyledText from '../components/StyledText';
import { ActivityIndicator } from 'react-native';

const ArticlesScreen = (props) => {
  const [articles, setArticles] = useState(null);
  const [isLoadingArticles, setLoadingArticles] = useState(false);
  const userContext = useContext(UserContext);
  const diseaseContext = useContext(DiseaseContext);
  const feedContext = useContext(PromedFeedContext);

  let [page, setPage] = useState(0);

  useEffect(() => {
    if (!articles) {
      fetchFeedArticles(page);
    }
  }, []);

  const fetchFeedArticles = async (page) => {
    setLoadingArticles(true);
    const articlesResponse = await getFeedArticles(userContext.apiKey, 
      feedContext.feedStartDate, feedContext.feedEndDate, 
      [diseaseContext.disease.name], "Australia", page
    );
    setArticles(articlesResponse.articles ? articlesResponse.articles : []);
    setLoadingArticles(false);
  };  

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  };

  const onEndReached = async () => {
    if (isLoadingArticles) {
      return;
    }
    setLoadingArticles(true);
    const articlesResponse = await getFeedArticles(userContext.apiKey, 
      feedContext.feedStartDate, feedContext.feedEndDate, 
      [diseaseContext.disease.name], "Australia", page+1
    );
    if (!articlesResponse.articles) {
      setLoadingArticles(false);
    }
    setArticles([...articles].concat(articlesResponse.articles || []));
    setPage(page + 1);
    setLoadingArticles(false);
  };

  const formatArticles = (articles) => {
    if(!articles || !articles.length) {
      return <StyledText nofound>No articles found for {diseaseContext.disease.name}</StyledText>;
    }
    return articles.map((article, i) => (
      <View key={i}> 
        <ArticleCard article={article} navigation={props.navigation}/>
      </View>
    ));
  };

  return (
    <View>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl 
            colors={[Colors.primary, Colors.secondary]} 
            refreshing={isLoadingArticles} 
            onRefresh={() => {
              setPage(0);
              fetchFeedArticles(0);
            }}
          />
        }
        onScroll = {({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            onEndReached();
          }
        }}
      >
        <StyledText nofound>Showing articles for {diseaseContext.disease.name} in Australia</StyledText>
        {(articles) ? formatArticles(articles) : <ActivityIndicator size='large' color={Colors.primary}/>}
      </ScrollView>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg,
    padding: 24,
  }, 
});

export default ArticlesScreen;
