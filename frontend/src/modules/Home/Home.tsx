import { useWeb3 } from "@chainsafe/web3-context";
import { useEffect } from "react";
import styled from "styled-components";
import { ISelectOption } from "../../common/commonTypes";
import ActionButtons from "../../common/components/ActionButtons/ActionButtons";
import AppMessage from "../../common/components/AppMessage";
import AssetSelect from "../../common/components/AssetSelect";
import BridgeRoutes from "../../common/components/BridgeRoutes/BridgeRoutes";
import Icon from "../../common/components/Icon/Icon";
import AmountInput from "../../common/components/Input";
import HydraModal from "../../common/components/Modal/HydraModal";
import TransferChainSelects from "../../common/components/TransferChain/TransferChainSelects";
import { BuildTxRequestDto, ChainResponseDto } from "../../common/dtos";
import {
  getFlexCenter,
  getVerticalGap,
} from "../../common/styles";
import useHome from "./useHome";

const Root = styled.div``;


const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 520px;
  width: 100%;
  margin-top: 3rem;
  padding: 10px;
`;

const TransferWrapper = styled.div`
  background: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px,
    rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;
  border-radius: 24px;
  margin-left: auto;
  margin-right: auto;
  z-index: 1;
  padding: 10px;
`;
const SendWrapper = styled.div`
  ${getFlexCenter}
  width: 100%;
  margin-bottom: 20px;
`;

const Container = styled.div`
  width: 100%;
`;

const AmountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  ${getVerticalGap("15px")};
`;

const ErrorContainer = styled.div`
  margin-bottom: 10px;
`;

const Home = () => {
  const {
    onConnectWallet,
    onCheckAllowance,
    onBuildApproveTxData,
    onApproveWallet,
    onReset,
    getBridgeTxData,
    onGetQuote,
    setChainFrom,
    setChainTo,
    setAsset,
    setAmountIn,
    setAmountOut,
    setRouteId,
    setIsErrorOpen,
    setInProgress,
    setTxHash,
    setIsModalOpen,
    setError,
    tokens,
    token,
    ethPrice,
    isEth,
    chains,
    amountIn,
    amountOut,
    routeId,
    asset,
    isErrorOpen,
    isApproved,
    inProgress,
    isModalOpen,
    bridgeTx,
    provider,
    bridgeRoutes,
    chainTo,
    chainFrom,
    txHash,
    error,
  } = useHome();
  const { address } = useWeb3();
  const isAbleToMove = isApproved || isEth;
  const isConnected = !!address
  
  useEffect(() => {
    async function checkAllowance() {
      await onCheckAllowance(amountIn, chainFrom, token?.address!);
    }
    if (isConnected && !isEth) {
      checkAllowance();
    }
  }, [isConnected, asset, amountIn, chainFrom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function getBridgesQuote() {
  
      await onGetQuote({
        recipient: address!,
        fromAsset: asset,
        fromChainId: chainFrom,
        toAsset: asset,
        toChainId: chainTo,
        amount: amountIn,
      });
    }
    if (isConnected && isAbleToMove && address) {
      getBridgesQuote();
    }
  }, [asset, chainFrom, chainTo, amountIn, isConnected, isApproved]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function getApproveTxData() {
      await onBuildApproveTxData(chainFrom, token?.address!, amountIn);
    }

    if (isConnected && !isEth) {
      getApproveTxData();
    }
  }, [isConnected, amountIn, chainFrom, asset, routeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function getMoveTxData() {
   
      const dto: BuildTxRequestDto = {
        amount: amountIn,
        fromAsset: asset!,
        toAsset: asset!,
        fromChainId: chainFrom!,
        toChainId: chainTo!,
        routeId: routeId!,
        recipient: address!,
      };

      await getBridgeTxData(dto);
    }

    if (address && (isApproved || (isEth && routeId > 0))) {
      getMoveTxData();
    }
  }, [isApproved, routeId, amountIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChainFrom = (option: any) => {
    if (option.value !== chainTo) {
      setChainFrom(option ? option.value : null);
    }
  };

  const handleSelectChainTo = (option: any) => {
    if (option.value !== chainFrom) {
      setChainTo(option ? option.value : null);
    }
  };

  const handleSelectAsset = (option: any) => {
    setAsset(option ? option.value : null);
  };

  const handleAmountInChange = (e: any) => {
    const { value } = e.target;
    if (value >= 0) {
      setAmountIn(value);
      setAmountOut(value);
    } else {
      setAmountIn(0);
      setAmountOut(0.0);
    }
  };

  const handleOnRouteClick = (id: number) => {
    if (!inProgress) {
      setRouteId(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMoveAssets = async () => {
    try {
      const signer = provider.getUncheckedSigner();
      const { data, to, from, value } = bridgeTx;
      console.log("bridge tx move:", bridgeTx);
      let dto: any = { data, to, from };
      if (isEth) {
        dto.value = value;
      }

      const tx = await signer.sendTransaction(dto);
      setInProgress(true);
      setTxHash(tx.hash);
      setIsModalOpen(true);
      console.log("Move tx", tx);
      const receipt = await tx.wait();
      if (receipt.logs) {
        onReset();
        console.log("Move receipt logs", receipt.logs);
      }
    } catch (e: any) {
      console.log(e);
      setError("Something went wrong!");
      setIsErrorOpen(true);
    }
  };

  const chainsFrom: ISelectOption[] = chains
    ? chains
        .filter((item) => item.chainId === 5)
        .map((chain: ChainResponseDto) => {
          return {
            label: chain.name,
            value: chain.chainId,
            icon: <Icon name={"eth"} size="20px" />,
          };
        })
    : [];

  const chainsTo: ISelectOption[] = chains
    ? chains
        .filter((item) => item.chainId === 80001)
        .map((chain: ChainResponseDto) => {
          return {
            label: chain.name,
            value: chain.chainId,
            icon: <Icon name={"polygon"} size="20px" />,
          };
        })
    : [];

  return (
    <>
      <Root>
        <Wrapper>
          <SendWrapper>
            <AssetSelect
              selectedTokenId={asset}
              tokens={tokens}
              onSelectAsset={handleSelectAsset}
              isLoading={inProgress}
            />
          </SendWrapper>
          {error && (
            <ErrorContainer>
              <AppMessage
                isOpen={isErrorOpen}
                message={error}
                onClose={() => setIsErrorOpen(false)}
              />
            </ErrorContainer>
          )}
          <TransferWrapper>
            <Container>
              <TransferChainSelects
                chainsFrom={chainsFrom}
                chainsTo={chainsTo}
                chainFrom={chainFrom}
                chainTo={chainTo}
                onSelectChainFrom={handleSelectChainFrom}
                onSelectChainTo={handleSelectChainTo}
                isDisabled={inProgress}
              />
              <AmountsContainer>
                <AmountInput
                  amount={amountIn && amountIn}
                  min={0}
                  label={"Send"}
                  onChange={handleAmountInChange}
                  disabled={inProgress}
                />
                <AmountInput
                  amount={amountOut && amountOut}
                  step={0.01}
                  placeholder={"0.0"}
                  label={"Receive"}
                  disabled={true}
                />
              </AmountsContainer>
              <ActionButtons
                isConnected={isConnected}
                isApproved={isApproved}
                inProgress={inProgress}
                isRouteIdSelected={routeId > 0}
                isEth={isEth}
                isAmountSet={!!amountIn}
                isAbleToMove={isAbleToMove}
                onWalletConnect={onConnectWallet}
                onWalletApprove={onApproveWallet}
                onMoveAssets={handleMoveAssets}
              />
            </Container>
          </TransferWrapper>
          {isAbleToMove && !!amountIn && amountIn > 0 && isConnected && (
            <BridgeRoutes
              isEth={isEth}
              isInProgress={inProgress}
              ethPrice={ethPrice}
              selectedRouteId={routeId}
              routes={bridgeRoutes}
              onClick={handleOnRouteClick}
            />
          )}
        </Wrapper>
      </Root>

      <HydraModal
        subtitle="Transaction"
        onClose={handleCloseModal}
        isOpen={isModalOpen}
        tx={txHash!}
      />
    </>
  );
};

export default Home;
