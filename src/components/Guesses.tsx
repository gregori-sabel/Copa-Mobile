import { Box, FlatList, useToast } from 'native-base';
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { EmptyMyPoolList } from './EmptyMyPoolList';
import { Game, GameProps } from './Game';
import { Loading } from './Loading';

interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ games, setGames ] = useState<GameProps[]>([]);
  const [ firstTeamPoints, setFirstTeamPoints ] = useState('');
  const [ secondTeamPoints, setSecondTeamPoints ] = useState('');

  const toast = useToast();
  
  async function fetchGames() {
    try{
      setIsLoading(true);

      const response = await api.get(`/pools/${poolId}/games`)
      setGames(response.data.games)
      

    } catch (err) {
      console.log(err);

      return toast.show({
        title: 'Não foi possível carregar os detalhes do bolão',
        placement: 'top',
        bgColor: 'red.500'
      });
    } finally{
      setIsLoading(false)
    }
  }

  async function handleGuessConfirm(gameId: string) {
    try {
      if(!firstTeamPoints.trim() || !secondTeamPoints.trim()){
        return toast.show({
          title: 'Informe o placar do palpite',
          placement: 'top',
          bgColor: 'red.500'
        });
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guess`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      })

      toast.show({
        title: 'Palpite realizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500'
      });

      fetchGames();

    } catch(err) {
      console.log(err)

      return toast.show({
        title: 'Não foi possível enviar o palpite',
        placement: 'top',
        bgColor: 'red.500'
      });
    }
  }

  useEffect(() => {
    fetchGames();
  },[poolId])

  if(isLoading){
    return <Loading />
  }

  return (
    <FlatList 
      data={games}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Game 
          data={item}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
        />  
      )}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
    />
  );
}
