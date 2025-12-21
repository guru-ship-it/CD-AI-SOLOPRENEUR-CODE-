from abc import ABC, abstractmethod

class PoliceStrategy(ABC):
    @abstractmethod
    def verify(self, data: dict):
        pass

class TsPoliceStrategy(PoliceStrategy):
    def verify(self, data: dict):
        return {"state": "TS", "status": "Initiated via TSPolice Portal", "portal": "tspolice.gov.in"}

class KaSevaSindhuStrategy(PoliceStrategy):
    def verify(self, data: dict):
        return {"state": "KA", "status": "Initiated via Seva Sindhu", "portal": "sevasindhu.karnataka.gov.in"}

class TnEservicesStrategy(PoliceStrategy):
    def verify(self, data: dict):
        return {"state": "TN", "status": "Initiated via TN Police E-Services", "portal": "eservices.tnpolice.gov.in"}

class ApPoliceStrategy(PoliceStrategy):
    def verify(self, data: dict):
        return {"state": "AP", "status": "Initiated via AP Police", "portal": "appolice.gov.in"}

class PoliceVerifier:
    def __init__(self):
        self._strategies = {
            "TS": TsPoliceStrategy(),
            "KA": KaSevaSindhuStrategy(),
            "TN": TnEservicesStrategy(),
            "AP": ApPoliceStrategy()
        }

    def get_strategy(self, state_code: str) -> PoliceStrategy:
        strategy = self._strategies.get(state_code.upper())
        if not strategy:
            raise ValueError(f"State code {state_code} not supported.")
        return strategy

    def verify_candidate(self, state_code: str, candidate_data: dict):
        strategy = self.get_strategy(state_code)
        return strategy.verify(candidate_data)
